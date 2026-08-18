import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { codeGenerationPipeline } from '../../code-generation-pipeline';
import { workspacePipelineFacade } from '../../workspace-pipeline-integrator';
import { NodeFsAdapter } from '../../workspace-engine/fs-adapter';
import { OllamaCodingProviderAdapter } from '../../inference';
import { IDevelopmentRequest } from '../../planning-validator-handoff/types';
import { ExecutorEventType } from './executorTypes';
import { ExecutionEvents } from './executionEvents';
import { scheduleTaskDag, IDagTask } from '../../planner/dagScheduler';

export class ExecutorAgent extends BaseAgent {
  private events = new ExecutionEvents();

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  /**
   * Main entry point to run tasks.
   */
  public async executeTask(task: AgentTask): Promise<any> {
    console.log('[TRACE] [Executor] ENTER: executeTask');
    this.status = AgentStatus.Running;
    const payload = task.payload || {};

    const rawPrompt = payload.rawPrompt || 'Build calculator';
    const aiRequest = payload.aiRequest;
    const modelId = payload.modelId || 'qwen2.5-coder:7b';
    const workspacePath = payload.workspacePath || '.';

    console.log('[ExecutorAgent] Generation Started');

    try {
      // Build a real development request from the incoming payload
      const lowerPrompt = rawPrompt.toLowerCase();
      let targetLanguage = aiRequest?.projectInfo?.language;
      let targetFrontend = aiRequest?.projectInfo?.frontendFramework;

      if (!targetLanguage || !targetFrontend) {
        if (/\b(html|html5|webpage|table)\b/i.test(lowerPrompt) && !/\b(react|next|vue|angular|svelte|tsx|jsx)\b/i.test(lowerPrompt)) {
          targetLanguage = targetLanguage || 'HTML';
          targetFrontend = targetFrontend || 'HTML5';
        } else if (/\b(python|py|fastapi|flask|django)\b/i.test(lowerPrompt)) {
          targetLanguage = targetLanguage || 'Python';
          targetFrontend = targetFrontend || 'None';
        } else if (/\b(java|spring)\b/i.test(lowerPrompt)) {
          targetLanguage = targetLanguage || 'Java';
          targetFrontend = targetFrontend || 'None';
        } else {
          targetLanguage = targetLanguage || 'TypeScript';
          targetFrontend = targetFrontend || 'React';
        }
      }

      const devRequest: IDevelopmentRequest = {
        requestId: task.id,
        projectInfo: {
          name: aiRequest?.projectInfo?.name || 'Project',
          type: aiRequest?.projectInfo?.type || 'Web Application',
          description: rawPrompt,
          targetPlatform: aiRequest?.projectInfo?.targetPlatform || 'Web',
          language: targetLanguage,
          frontendFramework: targetFrontend,
          backendFramework: aiRequest?.projectInfo?.backendFramework || 'Express',
          database: aiRequest?.projectInfo?.database || null,
          authentication: aiRequest?.projectInfo?.authentication || null,
          deploymentTarget: aiRequest?.projectInfo?.deploymentTarget || null
        },
        technologyStack: {
          language: targetLanguage,
          frontend: targetFrontend,
          backend: aiRequest?.projectInfo?.backendFramework || 'Express',
          database: aiRequest?.projectInfo?.database || null
        },
        executionPhases: (() => {
          const rawTasks: IDagTask[] = payload.tasks || payload.plan?.tasks || [];
          if (rawTasks.length === 0) {
            throw new Error('Execution Failed: ExecutorAgent received empty task graph (0 execution tasks in ExecutionPlan).');
          }
          const scheduled = scheduleTaskDag(rawTasks);
          return scheduled.levels.map(level => ({
            phaseName: `Level-${level.levelIndex}`,
            tasks: level.tasks,
            modules: level.tasks.map(t => t.requiredCapability || t.title)
          }));
        })(),
        validatedTaskGraph: [],
        dependencies: [],
        warnings: [],
        metadata: {
          generatedAt: Date.now(),
          validatedAt: Date.now(),
          schemaVersion: '1.0.0',
          conversationHistory: payload.conversationHistory,
          sourceCodeContext: payload.sourceCodeContext
        }
      };

      const rawTasks: IDagTask[] = payload.tasks || payload.plan?.tasks || [];
      const targetFilesScope: string[] = payload.targetFiles || payload.plan?.targetFiles || rawTasks.flatMap(t => t.targetFiles || []);
      (devRequest as any).targetFiles = Array.from(new Set(targetFilesScope));

      console.log('[ExecutorAgent] Ollama Request: sending code synthesis tasks');
      const codeProvider = payload.codingProvider || new OllamaCodingProviderAdapter(modelId);

      // Invoke coding runtime via codeGenerationPipeline to produce generation contracts
      const generationResult = await codeGenerationPipeline.generateCode(
        devRequest,
        codeProvider,
        (mod, progress) => {
          console.log(`[ExecutorAgent] Progress: ${mod} (${progress}%)`);
        },
        workspacePath
      );

      console.log('[ExecutorAgent] Ollama Response received successfully');
      console.log(`[ExecutorAgent] Generation Contracts Created: ${generationResult.generatedContracts.length}`);

      if (generationResult.errors && generationResult.errors.length > 0) {
        console.error('[ExecutorAgent] Generation Errors:', generationResult.errors.join('; '));
        throw new Error(`Generation failed with errors: ${generationResult.errors.join('; ')}`);
      }

      // Apply contracts using Workspace Pipeline
      const fs = payload.fsAdapter || new NodeFsAdapter(workspacePath);
      let workspaceReport: any;
      try {
        workspaceReport = await workspacePipelineFacade.applyContracts(generationResult.generatedContracts, fs);
      } catch (applyErr: any) {
        console.warn('[ExecutorAgent] workspacePipelineFacade.applyContracts error:', applyErr.message);
        workspaceReport = { createdFiles: [] };
      }

      if ((!workspaceReport || !workspaceReport.createdFiles || workspaceReport.createdFiles.length === 0) && targetFilesScope.length > 0) {
        console.warn(`[ExecutorAgent] Pipeline executed but 0 files were written for target scope: ${targetFilesScope.join(', ')}.`);
        workspaceReport = { createdFiles: [] };
      }

      console.log(`[ExecutorAgent] Files Written: ${workspaceReport.createdFiles.join(', ')}`);
      console.log('[ExecutorAgent] Review Changes Updated');

      this.status = AgentStatus.Completed;

      const executorResult = {
        success: true,
        generationResult,
        workspaceReport
      };
      console.log('[TRACE] [Executor] EXIT: executeTask completed');
      return executorResult;
    } catch (err: any) {
      console.error('[ExecutorAgent] Error during task execution:', err.message);
      this.events.emit(ExecutorEventType.TaskFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      console.log('[TRACE] [Executor] EXIT: executeTask failed with error:', err.message);
      throw err;
    }
  }
}

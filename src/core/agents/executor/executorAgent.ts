import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { codeGenerationPipeline } from '../../code-generation-pipeline';
import { workspacePipelineFacade } from '../../workspace-pipeline-integrator';
import { NodeFsAdapter } from '../../workspace-engine/fs-adapter';
import { OllamaCodingProviderAdapter } from '../../inference';
import { IDevelopmentRequest } from '../../planning-validator-handoff/types';
import { ExecutorEventType } from './executorTypes';
import { ExecutionEvents } from './executionEvents';

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
      const devRequest: IDevelopmentRequest = {
        requestId: task.id,
        projectInfo: {
          name: aiRequest?.projectInfo?.name || 'Project',
          type: aiRequest?.projectInfo?.type || 'Web Application',
          description: rawPrompt,
          targetPlatform: aiRequest?.projectInfo?.targetPlatform || 'Web',
          language: aiRequest?.projectInfo?.language || 'TypeScript',
          frontendFramework: aiRequest?.projectInfo?.frontendFramework || 'React',
          backendFramework: aiRequest?.projectInfo?.backendFramework || 'Express',
          database: aiRequest?.projectInfo?.database || null,
          authentication: aiRequest?.projectInfo?.authentication || null,
          deploymentTarget: aiRequest?.projectInfo?.deploymentTarget || null
        },
        technologyStack: {
          language: aiRequest?.projectInfo?.language || 'TypeScript',
          frontend: aiRequest?.projectInfo?.frontendFramework || 'React',
          backend: aiRequest?.projectInfo?.backendFramework || 'Express',
          database: aiRequest?.projectInfo?.database || null
        },
        executionPhases: (/\b(html|landing|index\.html|css|style|website|calculator)\b/i.test(rawPrompt) && !/\b(fullstack|database|backend|express|nest|docker)\b/i.test(rawPrompt))
          ? [
              {
                phaseName: 'Frontend',
                modules: ['Frontend']
              }
            ]
          : [
              {
                phaseName: 'WorkspaceStructure',
                modules: ['WorkspaceStructure']
              },
              {
                phaseName: 'Configuration',
                modules: ['Configuration']
              },
              {
                phaseName: 'Database',
                modules: ['Database']
              },
              {
                phaseName: 'Backend',
                modules: ['Backend']
              },
              {
                phaseName: 'Frontend',
                modules: ['Frontend']
              }
            ],
        validatedTaskGraph: [],
        dependencies: [],
        warnings: [],
        metadata: {
          generatedAt: Date.now(),
          validatedAt: Date.now(),
          schemaVersion: '1.0.0'
        }
      };

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
      const fs = payload.fsAdapter || new NodeFsAdapter();
      const workspaceReport = await workspacePipelineFacade.applyContracts(generationResult.generatedContracts, fs);

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

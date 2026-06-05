import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { GeneratorSDK } from './generatorSDK';
import { IGeneratorExecutionContext, IGeneratorSDKResult } from './generatorSDKTypes';
import { ollamaRuntime } from '../../inference/providers/ollamaRuntime';

export class GeneratorSDKAgent extends BaseAgent {
  private sdk: GeneratorSDK;

  constructor(definition: AgentDefinition, sdk?: GeneratorSDK) {
    super(definition);
    this.sdk = sdk || new GeneratorSDK();
  }

  public getLogs(): readonly any[] {
    return this.sdk.getLogs();
  }

  public clearHistory(): void {
    this.sdk.clearHistory();
  }

  public subscribe(listener: (log: any) => void): () => void {
    return this.sdk.subscribe(listener);
  }

  /**
   * Primary AgentManager dispatch point.
   * Assembles full 9-part IGeneratorExecutionContext and routes execution strictly through GeneratorSDK framework.
   */
  public async executeTask(task: AgentTask): Promise<{ success: boolean; result: IGeneratorSDKResult }> {
    console.log('[TRACE] [GeneratorSDK] ENTER: executeTask');
    this.status = AgentStatus.Running;
    const payload = task.payload || {};
    console.log(`[WORKSPACE_TRACE] TaskContext=${payload.workspacePath}`);

    // Connect Generator SDK Agent to the actual Ollama Coding Runtime
    try {
      console.log('[GeneratorSDKAgent] Connecting to local coding runtime...');
      const isOnline = await ollamaRuntime.isServerRunning();
      if (!isOnline) {
        console.warn('[GeneratorSDKAgent] Ollama Coding Runtime server is offline.');
      } else {
        const models = await ollamaRuntime.listModels();
        console.log(`[GeneratorSDKAgent] Successfully connected to Ollama Coding Runtime. Models available: ${models.join(', ')}`);
      }
    } catch (err: any) {
      console.error('[GeneratorSDKAgent] Failed to establish connection to coding runtime:', err.message);
    }

    const context: IGeneratorExecutionContext = {
      requestId: payload.requestId || task.id,
      sessionId: payload.sessionId || `session-${Date.now()}`,
      requirementObject: payload.requirementObject || payload.requirementResult?.requirementObject || payload.requirementResult?.requirement,
      projectIntelligenceReport: payload.projectIntelligenceReport || payload.intelligenceResult?.report,
      engineeringDecisionReport: payload.engineeringDecisionReport || payload.decisionResult?.report,
      architectureBlueprint: payload.architectureBlueprint || payload.architectureResult?.blueprint,
      workspaceBlueprint: payload.workspaceBlueprint || payload.workspaceResult?.blueprint,
      projectManifest: payload.projectManifest || payload.manifestResult?.manifest,
      generationPlan: payload.generationPlan || payload.plannerResult?.plan,
      customPayload: payload
    };

    const sdkResult = await this.sdk.executePlan(context);

    this.status = sdkResult.success ? AgentStatus.Completed : AgentStatus.Failed;

    const finalSdkResult = {
      success: sdkResult.success,
      result: sdkResult
    };
    console.log('[TRACE] [GeneratorSDK] EXIT: executeTask completed');
    return finalSdkResult;
  }
}

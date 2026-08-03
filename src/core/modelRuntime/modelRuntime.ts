import { runtimeEngine } from './runtimeEngine';
import { runtimeContextManager } from './runtimeContext';
import { modelManager } from './modelManager';
import { runtimeRegistry } from './runtimeRegistry';
import { runtimeLifecycle } from './runtimeLifecycle';
import { runtimeEvents } from './runtimeEvents';
import { ModelConfig, RuntimeReport, GenerationConfig, InferenceResult } from './runtimeTypes';
import { PromptPackage } from '../promptAssembly/promptTypes';

export class ModelRuntime {
  public getEngine() {
    return runtimeEngine;
  }

  public getContextManager() {
    return runtimeContextManager;
  }

  public getModelManager() {
    return modelManager;
  }

  public getRegistry() {
    return runtimeRegistry;
  }

  public async initialize(): Promise<void> {
    runtimeLifecycle.transition(1 as any); // Reset state
    runtimeLifecycle.reset();
    runtimeEvents.emit(1 as any, undefined, { initialized: true }); // RuntimeInit
  }

  public generateReport(): RuntimeReport {
    const activeModel = modelManager.getActiveConfig() || undefined;
    const health = runtimeEngine.getHealthReport();
    const metrics = runtimeEngine.getMetrics();
    const state = runtimeEngine.getModelState();

    return {
      reportId: `RPT-${Date.now()}`,
      timestamp: Date.now(),
      state,
      activeModel,
      health,
      metrics,
      queueLength: 0
    };
  }

  public async loadModel(config: ModelConfig): Promise<void> {
    await runtimeEngine.loadModel(config);
  }

  public async unloadModel(): Promise<void> {
    await runtimeEngine.unloadModel();
  }

  public async generate(
    promptPkg: PromptPackage,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    return runtimeEngine.generate(promptPkg, config, onToken, signal);
  }
}

export const modelRuntime = new ModelRuntime();

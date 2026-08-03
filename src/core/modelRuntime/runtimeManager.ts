import { runtimeEngine } from './runtimeEngine';
import { runtimeContextManager } from './runtimeContext';
import { runtimeRegistry } from './runtimeRegistry';
import { modelManager } from './modelManager';
import { ModelConfig, RuntimeReport } from './runtimeTypes';

export class RuntimeManager {
  public async initializeRuntime(): Promise<void> {
    // Perform initial health checks, clean up environment, load default provider
    const ctx = runtimeContextManager.getContext();
    console.log(`Initializing Model Runtime under context: ${ctx.runtimeId}`);
  }

  public async shutdownRuntime(): Promise<void> {
    // Gracefully unload current active models and stop providers
    const active = modelManager.getActiveConfig();
    if (active) {
      await runtimeEngine.unloadModel();
    }
  }

  public getRuntimeReport(): RuntimeReport {
    const activeModel = modelManager.getActiveConfig() || undefined;
    const health = runtimeEngine.getHealthReport();
    const metrics = runtimeEngine.getMetrics();
    const state = runtimeEngine.getModelState();

    return {
      reportId: `RT-RPT-${Date.now()}`,
      timestamp: Date.now(),
      state,
      activeModel,
      health,
      metrics,
      queueLength: 0
    };
  }

  public registerCustomProvider(name: string, provider: any): void {
    runtimeRegistry.registerProvider(name, provider);
  }
}

export const runtimeManager = new RuntimeManager();

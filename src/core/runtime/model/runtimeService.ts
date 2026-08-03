import { runtimeEngine } from '../../modelRuntime/runtimeEngine';
import { modelManager } from '../../modelRuntime/modelManager';
import { ModelConfig, ModelState, GenerationConfig, InferenceResult } from '../../modelRuntime/runtimeTypes';

export class RuntimeService {
  public subscribe(listener: any): () => void {
    return runtimeEngine.subscribe(listener);
  }

  public getModelState(): ModelState {
    return runtimeEngine.getModelState() as any;
  }

  public getActiveConfig(): ModelConfig | null {
    return modelManager.getActiveConfig();
  }

  public async loadModel(config: ModelConfig): Promise<void> {
    await runtimeEngine.loadModel(config);
  }

  public async unloadModel(): Promise<void> {
    await runtimeEngine.unloadModel();
  }

  public async generate(
    promptPkg: any,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    return runtimeEngine.generate(promptPkg, config, onToken, signal);
  }

  public getStats(): any {
    const active = modelManager.getActiveConfig();
    const metrics = runtimeEngine.getMetrics();
    const health = runtimeEngine.getHealthReport();
    return {
      loadedModel: active ? active.name : 'None',
      memoryUsageMb: metrics.ramUsageMb,
      vramUsageMb: metrics.vramUsageMb,
      cpuUsagePct: metrics.cpuUsagePct,
      gpuUsagePct: metrics.gpuUsagePct,
      inferenceSpeedTps: metrics.tokenThroughputTps,
      queueLength: 0,
      contextLength: metrics.contextLength,
      healthStatus: health.status
    };
  }
}

export const runtimeService = new RuntimeService();
export { RuntimeEvent } from '../../modelRuntime/runtimeTypes';

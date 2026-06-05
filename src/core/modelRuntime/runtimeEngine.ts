import { ModelConfig, ModelState, GenerationConfig, InferenceResult, RuntimeEventType, HealthReport } from './runtimeTypes';
import { ModelProvider } from './providers/baseProvider';
import { runtimeRegistry } from './runtimeRegistry';
import { runtimeEvents } from './runtimeEvents';
import { modelManager } from './modelManager';
import { modelLoader } from './modelLoader';
import { runtimeLifecycle } from './runtimeLifecycle';
import { runtimeMetricsTracker } from './runtimeMetrics';
import { runtimeHealthMonitor } from './runtimeHealth';
import { modelCache } from './modelCache';
import { inferenceSessionManager } from './inferenceSession';
import { InferenceQueue } from './inferenceQueue';
import { inferenceScheduler } from './inferenceScheduler';
import { inferenceMetricsTracker } from './inferenceMetrics';
import { runtimeValidator } from './runtimeValidator';
import { PromptPackage } from '../promptAssembly/promptTypes';

export class RuntimeEngine {
  private currentProvider: ModelProvider | null = null;
  private queue = new InferenceQueue();

  public subscribe(listener: any): () => void {
    return runtimeEvents.subscribe(listener);
  }

  public getModelState(): ModelState {
    return runtimeLifecycle.getState();
  }

  public getActiveConfig(): ModelConfig | null {
    return modelManager.getActiveConfig();
  }

  public async loadModel(config: ModelConfig): Promise<void> {
    runtimeValidator.validateModelConfig(config);
    modelManager.setActiveConfig(config);

    const provider = runtimeRegistry.getProvider(config.provider);
    if (!provider) {
      runtimeLifecycle.transition(ModelState.Failed, config.modelId);
      throw new Error(`Model runtime validation error: Provider not available: ${config.provider}`);
    }
    this.currentProvider = provider;

    try {
      await modelLoader.load(config, (state) => {
        modelManager.setModelState(state);
      });

      await provider.loadModel(config);
      modelCache.set(config.modelId, config);

      runtimeLifecycle.transition(ModelState.Ready, config.modelId);
      runtimeEvents.emit(RuntimeEventType.ModelReady, config.modelId);
    } catch (err: any) {
      runtimeLifecycle.transition(ModelState.Failed, config.modelId);
      runtimeEvents.emit(RuntimeEventType.RuntimeError, config.modelId, { error: err.message });
      throw err;
    }
  }

  public async unloadModel(): Promise<void> {
    const config = modelManager.getActiveConfig();
    if (!config) return;

    try {
      if (this.currentProvider) {
        await this.currentProvider.unloadModel();
      }
      await modelLoader.unload(config.modelId, (state) => {
        modelManager.setModelState(state);
      });
      modelManager.setActiveConfig(null);
      this.currentProvider = null;
      runtimeLifecycle.transition(ModelState.Registered, config.modelId);
    } catch (err: any) {
      runtimeEvents.emit(RuntimeEventType.RuntimeError, config.modelId, { error: err.message });
      throw err;
    }
  }

  public async generate(
    promptPkg: PromptPackage,
    config: GenerationConfig,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResult> {
    const activeConfig = modelManager.getActiveConfig();
    if (!activeConfig) {
      throw new Error('Model runtime validation error: Model is not loaded.');
    }

    const promptTokens = Math.ceil(promptPkg.userPrompt.length / 4);

    runtimeValidator.validateInference(
      promptPkg,
      runtimeLifecycle.getState(),
      activeConfig,
      promptTokens
    );
    runtimeValidator.validateConfig(config);

    if (!this.currentProvider) {
      throw new Error('Model runtime validation error: Provider is not available.');
    }

    runtimeLifecycle.transition(ModelState.Running, activeConfig.modelId);
    runtimeEvents.emit(RuntimeEventType.InferenceStarted, activeConfig.modelId);

    const start = Date.now();
    let timeToFirstTokenMs: number | undefined;

    return new Promise<InferenceResult>((resolve, reject) => {
      this.queue.enqueue({
        promptPkg,
        config,
        onToken: (tok) => {
          if (!timeToFirstTokenMs) {
            timeToFirstTokenMs = Date.now() - start;
          }
          if (onToken) onToken(tok);
          runtimeEvents.emit(RuntimeEventType.TokenGenerated, activeConfig.modelId, { token: tok });
        },
        resolve: (res) => {
          const latency = Date.now() - start;
          const runMetrics = inferenceMetricsTracker.trackRun(
            res.usage.promptTokens,
            res.usage.completionTokens,
            latency,
            timeToFirstTokenMs
          );
          res.metrics = runMetrics;

          if (res.finishReason === 'cancelled') {
            runtimeLifecycle.transition(ModelState.Idle, activeConfig.modelId);
            runtimeEvents.emit(RuntimeEventType.InferenceCancelled, activeConfig.modelId);
          } else {
            runtimeLifecycle.transition(ModelState.Idle, activeConfig.modelId);
            runtimeEvents.emit(RuntimeEventType.InferenceCompleted, activeConfig.modelId, { res });
          }
          resolve(res);
        },
        reject: (err) => {
          runtimeLifecycle.transition(ModelState.Failed, activeConfig.modelId);
          runtimeEvents.emit(RuntimeEventType.RuntimeError, activeConfig.modelId, { error: err.message });
          reject(err);
        },
        signal
      });

      inferenceScheduler.processQueue(this.queue, this.currentProvider!);
    });
  }

  public getHealthReport(): HealthReport {
    const metrics = this.getMetrics();
    const providerStatus = this.currentProvider ? 'available' : 'unavailable';
    return runtimeHealthMonitor.evaluateHealth(metrics, providerStatus);
  }

  public getMetrics() {
    const active = modelManager.getActiveConfig() || undefined;
    const isBusy = inferenceScheduler.isBusy();
    return runtimeMetricsTracker.getMetrics(active, isBusy, this.queue.getLength());
  }
}

export const runtimeEngine = new RuntimeEngine();

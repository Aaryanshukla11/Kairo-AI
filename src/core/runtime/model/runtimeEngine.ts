import { ModelConfig, ModelState, GenerationConfig, InferenceResult, RuntimeEventType } from './runtimeTypes';
import { ModelProvider, MockProvider } from './providers';
import { RuntimeEvents } from './runtimeEvents';
import { modelManager } from './modelManager';
import { modelLoader } from './modelLoader';
import { InferenceQueue } from './inferenceQueue';
import { inferenceScheduler } from './inferenceScheduler';
import { tokenizer } from './tokenizer';
import { runtimeValidator } from './runtimeValidator';
import { PromptPackage } from '../../promptAssembly/promptTypes';
import { runtimeRegistry, RuntimeRegistryStats } from './runtimeRegistry';

export class RuntimeEngine {
  private events = new RuntimeEvents();
  private provider: ModelProvider = new MockProvider();
  private queue = new InferenceQueue();

  /**
   * Subscribes a listener to Model Runtime changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public getModelState(): ModelState {
    return modelManager.getModelState();
  }

  public getActiveConfig(): ModelConfig {
    return modelManager.getActiveConfig();
  }

  // --- APIs ---

  public async loadModel(config: ModelConfig): Promise<void> {
    this.events.emit(RuntimeEventType.ModelLoading, config.modelId);
    modelManager.setActiveConfig(config);

    try {
      await modelLoader.load(config, (state) => {
        modelManager.setModelState(state);
      });
      await this.provider.loadModel(config);
      this.events.emit(RuntimeEventType.ModelLoaded, config.modelId);
    } catch (err: any) {
      modelManager.setModelState(ModelState.Failed);
      this.events.emit(RuntimeEventType.RuntimeError, config.modelId, { error: err.message });
      throw err;
    }
  }

  public async unloadModel(): Promise<void> {
    const config = modelManager.getActiveConfig();
    try {
      await modelLoader.unload((state) => {
        modelManager.setModelState(state);
      });
      await this.provider.unloadModel();
    } catch (err: any) {
      this.events.emit(RuntimeEventType.RuntimeError, config.modelId, { error: err.message });
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
    const promptTokens = tokenizer.countTokens(promptPkg.userPrompt);

    runtimeValidator.validateInference(
      promptPkg,
      modelManager.getModelState(),
      activeConfig,
      promptTokens
    );
    runtimeValidator.validateConfig(config);

    this.events.emit(RuntimeEventType.InferenceStarted, activeConfig.modelId);

    return new Promise<InferenceResult>((resolve, reject) => {
      this.queue.enqueue({
        promptPkg,
        config,
        onToken: (tok) => {
          if (onToken) onToken(tok);
          this.events.emit(RuntimeEventType.TokenGenerated, activeConfig.modelId, { token: tok });
        },
        resolve: (res) => {
          if (res.finishReason === 'cancelled') {
            this.events.emit(RuntimeEventType.InferenceCancelled, activeConfig.modelId);
          } else {
            this.events.emit(RuntimeEventType.InferenceCompleted, activeConfig.modelId, { res });
          }
          resolve(res);
        },
        reject: (err) => {
          this.events.emit(RuntimeEventType.RuntimeError, activeConfig.modelId, { error: err.message });
          reject(err);
        },
        signal
      });

      inferenceScheduler.processQueue(this.queue, this.provider);
    });
  }

  public getStats(): RuntimeRegistryStats {
    const active = modelManager.getActiveConfig();
    const isBusy = inferenceScheduler.isBusy();
    return runtimeRegistry.getStats(active.name, isBusy, this.queue.getLength());
  }
}

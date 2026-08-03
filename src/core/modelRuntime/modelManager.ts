import { ModelConfig, ModelState } from './runtimeTypes';

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    modelId: 'qwen-2.5-7b-coder',
    name: 'Qwen 2.5 7B Coder (GGUF Mock)',
    provider: 'MockProvider',
    contextWindow: 32768,
    parametersCount: '7B',
    fileSizeGb: 4.5
  },
  {
    modelId: 'llama-3-8b-instruct',
    name: 'Llama 3 8B Instruct (GGUF Mock)',
    provider: 'MockProvider',
    contextWindow: 8192,
    parametersCount: '8B',
    fileSizeGb: 4.9
  }
];

export class ModelManager {
  private registeredModels = new Map<string, ModelConfig>();
  private activeConfig: ModelConfig | null = null;
  private state: ModelState = ModelState.Registered;

  constructor() {
    // Register default models
    for (const model of DEFAULT_MODELS) {
      this.registerModel(model);
    }
  }

  public registerModel(config: ModelConfig): void {
    this.registeredModels.set(config.modelId, config);
  }

  public unregisterModel(modelId: string): void {
    this.registeredModels.delete(modelId);
  }

  public getRegisteredModels(): ModelConfig[] {
    return Array.from(this.registeredModels.values());
  }

  public getModelConfig(modelId: string): ModelConfig | undefined {
    return this.registeredModels.get(modelId);
  }

  public getActiveConfig(): ModelConfig | null {
    return this.activeConfig;
  }

  public setActiveConfig(config: ModelConfig | null): void {
    this.activeConfig = config;
  }

  public getModelState(): ModelState {
    return this.state;
  }

  public setModelState(state: ModelState): void {
    this.state = state;
  }
}

export const modelManager = new ModelManager();

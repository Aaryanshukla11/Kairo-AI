import { ModelConfig, ModelState } from './runtimeTypes';

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    modelId: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    parametersCount: 'Cloud',
    fileSizeGb: 0
  },
  {
    modelId: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    provider: 'Ollama',
    contextWindow: 32768,
    parametersCount: '7B',
    fileSizeGb: 4.5
  },
  {
    modelId: 'nomic-embed-text',
    name: 'Nomic Embed Text',
    provider: 'Ollama',
    contextWindow: 8192,
    parametersCount: '137M',
    fileSizeGb: 0.28
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

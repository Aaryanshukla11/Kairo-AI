import { IModelMetadata, ModelHealthStatus } from '../types';

export class ModelRegistry {
  private models: Map<string, IModelMetadata> = new Map();

  constructor() {
    this.initializeDefaultRegistry();
  }

  private initializeDefaultRegistry(): void {
    const defaults: IModelMetadata[] = [
      {
        modelId: 'gpt-4o',
        name: 'OpenAI GPT-4o',
        type: 'Planning Model',
        supportedTasks: ['NEW_PROJECT', 'MODIFY_PROJECT'],
        capabilities: ['reasoning', 'planning', 'structured-output'],
        contextWindow: 128000,
        status: 'Ready',
        priority: 100,
        version: '4.0.0'
      },
      {
        modelId: 'gpt-4o-coding',
        name: 'OpenAI GPT-4o Coding',
        type: 'Coding Model',
        supportedTasks: ['DEBUG_PROJECT', 'EXPLAIN_CODE', 'CHAT', 'UNKNOWN'],
        capabilities: ['code-generation', 'debugging', 'testing'],
        contextWindow: 128000,
        status: 'Ready',
        priority: 100,
        version: '4.0.0'
      },
      {
        modelId: 'qwen2.5-coder:7b',
        name: 'Qwen 2.5 Coder 7B',
        type: 'Planning Model',
        supportedTasks: ['NEW_PROJECT', 'MODIFY_PROJECT'],
        capabilities: ['reasoning', 'planning', 'structured-output'],
        contextWindow: 32768,
        status: 'Ready',
        priority: 10,
        version: '2.5.0'
      },
      {
        modelId: 'qwen2.5-coder:7b-coding',
        name: 'Qwen 2.5 Coder 7B Coding',
        type: 'Coding Model',
        supportedTasks: ['DEBUG_PROJECT', 'EXPLAIN_CODE', 'CHAT', 'UNKNOWN'],
        capabilities: ['code-generation', 'debugging', 'testing'],
        contextWindow: 32768,
        status: 'Ready',
        priority: 10,
        version: '2.5.0'
      },
      {
        modelId: 'nomic-embed-text',
        name: 'Nomic Embed Text',
        type: 'Embedding Model',
        supportedTasks: ['SEARCH_DOCUMENTATION', 'KNOWLEDGE_RETRIEVAL'],
        capabilities: ['embeddings', 'semantic-search'],
        contextWindow: 8192,
        status: 'Ready',
        priority: 10,
        version: '1.0.0'
      }
    ];

    for (const model of defaults) {
      this.models.set(model.modelId, model);
    }
  }

  public getModel(modelId: string): IModelMetadata | undefined {
    return this.models.get(modelId);
  }

  public getModelsByType(type: string): IModelMetadata[] {
    return Array.from(this.models.values()).filter(m => m.type === type);
  }

  public updateModelStatus(modelId: string, status: ModelHealthStatus): boolean {
    const model = this.models.get(modelId);
    if (model) {
      const updated: IModelMetadata = { ...model, status };
      this.models.set(modelId, updated);
      return true;
    }
    return false;
  }

  public registerModel(model: IModelMetadata): void {
    this.models.set(model.modelId, model);
  }

  public getAllModels(): IModelMetadata[] {
    return Array.from(this.models.values());
  }
}

export const modelRegistry = new ModelRegistry();
export default modelRegistry;

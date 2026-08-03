import { ModelInfo } from './registryTypes';

export class ModelCatalog {
  private catalog = new Map<string, ModelInfo>();

  public add(model: ModelInfo): void {
    this.catalog.set(model.modelId, model);
  }

  public remove(modelId: string): void {
    this.catalog.delete(modelId);
  }

  public get(modelId: string): ModelInfo | undefined {
    return this.catalog.get(modelId);
  }

  public list(): ModelInfo[] {
    return Array.from(this.catalog.values());
  }

  public clear(): void {
    this.catalog.clear();
  }
}

export const modelCatalog = new ModelCatalog();

import { ModelConfig } from './runtimeTypes';

export class ModelCache {
  private cache = new Map<string, { config: ModelConfig; loadedAt: number }>();

  public get(modelId: string): ModelConfig | null {
    const entry = this.cache.get(modelId);
    if (!entry) return null;
    return entry.config;
  }

  public set(modelId: string, config: ModelConfig): void {
    this.cache.set(modelId, {
      config,
      loadedAt: Date.now()
    });
  }

  public has(modelId: string): boolean {
    return this.cache.has(modelId);
  }

  public evict(modelId: string): boolean {
    return this.cache.delete(modelId);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

export const modelCache = new ModelCache();

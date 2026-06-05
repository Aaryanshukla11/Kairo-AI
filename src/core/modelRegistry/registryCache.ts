import { ModelInfo } from './registryTypes';
import { registryMetricsTracker } from './registryMetrics';

export class RegistryCache {
  private cache = new Map<string, { model: ModelInfo; timestamp: number }>();
  private cacheDurationMs = 5 * 60 * 1000; // 5 minutes cache

  public get(path: string): ModelInfo | null {
    const entry = this.cache.get(path);
    if (!entry) {
      registryMetricsTracker.recordCacheAccess(false);
      return null;
    }

    if (Date.now() - entry.timestamp > this.cacheDurationMs) {
      this.cache.delete(path);
      registryMetricsTracker.recordCacheAccess(false);
      return null;
    }

    registryMetricsTracker.recordCacheAccess(true);
    return entry.model;
  }

  public set(path: string, model: ModelInfo): void {
    this.cache.set(path, {
      model,
      timestamp: Date.now()
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const registryCache = new RegistryCache();

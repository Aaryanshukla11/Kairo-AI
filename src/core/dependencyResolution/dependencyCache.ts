import { DependencyGraph } from './dependencyTypes';

export class DependencyCache {
  private cache = new Map<string, { graph: DependencyGraph; timestamp: number }>();
  private ttlMs = 30000; // 30 seconds default TTL

  public get(key: string): DependencyGraph | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return cached.graph;
  }

  public set(key: string, graph: DependencyGraph): void {
    this.cache.set(key, {
      graph,
      timestamp: Date.now()
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const dependencyCache = new DependencyCache();

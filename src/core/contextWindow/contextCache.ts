import { ContextItem } from './contextTypes';

export class ContextCache {
  private cache = new Map<string, { items: ContextItem[]; timestamp: number }>();
  private hits = 0;
  private misses = 0;

  public get(key: string): ContextItem[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.items;
  }

  public set(key: string, items: ContextItem[]): void {
    this.cache.set(key, {
      items,
      timestamp: Date.now()
    });
  }

  public getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 1.0
    };
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const contextCache = new ContextCache();

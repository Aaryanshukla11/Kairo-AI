import { VectorRecord } from './vectorStoreTypes';

export class VectorStoreCache {
  private cacheHits = 0;
  private cacheMisses = 0;
  private cacheMap = new Map<string, VectorRecord>();

  /**
   * Returns cached value and bumps hit rate.
   */
  public get(id: string): VectorRecord | null {
    const record = this.cacheMap.get(id);
    if (record) {
      this.cacheHits++;
      return record;
    }
    this.cacheMisses++;
    return null;
  }

  public set(id: string, record: VectorRecord): void {
    this.cacheMap.set(id, record);
  }

  public delete(id: string): void {
    this.cacheMap.delete(id);
  }

  public getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 100;
    return Math.floor((this.cacheHits / total) * 100);
  }

  public clear(): void {
    this.cacheMap.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

export const vectorStoreCache = new VectorStoreCache();

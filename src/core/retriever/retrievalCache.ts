import { RetrievedContext } from './retrieverTypes';

export class RetrievalCache {
  private cache = new Map<string, RetrievedContext>();

  private getCacheKey(prompt: string, currentFile?: string, filters?: Record<string, any>): string {
    return `${prompt}:${currentFile || ''}:${JSON.stringify(filters || {})}`;
  }

  public get(prompt: string, currentFile?: string, filters?: Record<string, any>): RetrievedContext | null {
    const key = this.getCacheKey(prompt, currentFile, filters);
    return this.cache.get(key) || null;
  }

  public set(prompt: string, currentFile: string | undefined, filters: Record<string, any> | undefined, value: RetrievedContext): void {
    const key = this.getCacheKey(prompt, currentFile, filters);
    this.cache.set(key, value);
  }

  public invalidate(): void {
    this.cache.clear();
  }
}

export const retrievalCache = new RetrievalCache();

import { CompiledPromptResult } from './promptTypes';

export class PromptCache {
  private cache = new Map<string, CompiledPromptResult>();

  public get(key: string): CompiledPromptResult | undefined {
    return this.cache.get(key);
  }

  public set(key: string, result: CompiledPromptResult): void {
    this.cache.set(key, result);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const promptCache = new PromptCache();

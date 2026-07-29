import { PromptPackage } from './promptTypes';

export class PromptCache {
  private cache = new Map<string, PromptPackage>();

  private getCacheKey(prompt: string, type: string, context?: any): string {
    return `${prompt}:${type}:${JSON.stringify(context || {})}`;
  }

  public get(prompt: string, type: string, context?: any): PromptPackage | null {
    const key = this.getCacheKey(prompt, type, context);
    return this.cache.get(key) || null;
  }

  public set(prompt: string, type: string, context: any, value: PromptPackage): void {
    const key = this.getCacheKey(prompt, type, context);
    this.cache.set(key, value);
  }

  public invalidate(): void {
    this.cache.clear();
  }
}

export const promptCache = new PromptCache();

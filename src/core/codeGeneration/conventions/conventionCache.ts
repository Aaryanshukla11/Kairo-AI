import { ConventionProfile } from './conventionTypes';

export class ConventionCache {
  private cache: ConventionProfile | null = null;

  public get(): ConventionProfile | null {
    return this.cache;
  }

  public set(profile: ConventionProfile): void {
    this.cache = profile;
  }

  public clear(): void {
    this.cache = null;
  }
}

export const conventionCache = new ConventionCache();

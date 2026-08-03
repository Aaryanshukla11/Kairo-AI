import { RoutingDecisionModel } from './routingTypes';

export class RoutingCache {
  private cache = new Map<string, RoutingDecisionModel>();

  public get(key: string): RoutingDecisionModel | undefined {
    return this.cache.get(key);
  }

  public set(key: string, decision: RoutingDecisionModel): void {
    this.cache.set(key, decision);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const routingCache = new RoutingCache();

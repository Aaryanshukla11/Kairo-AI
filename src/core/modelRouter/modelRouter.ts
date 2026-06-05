import { routerEngine } from './routerEngine';
import { routingHistory } from './routingHistory';
import { routingCache } from './routingCache';
import { routingEvents } from './routingEvents';
import { RoutingRequest, RoutingDecisionModel } from './routingTypes';

export class ModelRouter {
  public async route(request: RoutingRequest): Promise<RoutingDecisionModel> {
    const cacheKey = JSON.stringify(request);
    const cached = routingCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const decision = await routerEngine.resolve(request);
    routingCache.set(cacheKey, decision);
    return decision;
  }

  public getHistory(): RoutingDecisionModel[] {
    return routingHistory.getHistory();
  }

  public clear(): void {
    routingCache.clear();
    routingHistory.clear();
  }

  public subscribe(listener: any): () => void {
    return routingEvents.subscribe(listener);
  }
}

export const modelRouter = new ModelRouter();

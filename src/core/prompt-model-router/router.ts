import { modelRegistry } from './registry';
import { routingRules } from './rules';
import { IRoutingDecision, ModelType, IModelMetadata } from './types';

export class PromptModelRouter {
  public route(requestId: string, intent: string): IRoutingDecision {
    const targetType = routingRules.resolveModelType(intent);
    
    // Fetch models matching type
    const candidates = modelRegistry.getModelsByType(targetType);
    
    // Filter healthy models (Ready or Loaded or Busy)
    const healthyCandidates = candidates.filter(m => m.status === 'Ready' || m.status === 'Loaded' || m.status === 'Busy');
    
    // Sort by priority descending
    healthyCandidates.sort((a, b) => b.priority - a.priority);

    if (healthyCandidates.length === 0) {
      throw new Error(`No healthy model candidates available for type '${targetType}'`);
    }

    const selected = healthyCandidates[0];
    const fallbackList = healthyCandidates.slice(1).map(m => m.modelId);

    const decision: IRoutingDecision = {
      requestId,
      selectedModel: {
        modelId: selected.modelId,
        name: selected.name,
        type: selected.type
      },
      modelType: targetType,
      reason: `Selected highest-priority healthy candidate '${selected.name}' (${selected.modelId}) for intent '${intent}'`,
      fallbackModels: Object.freeze(fallbackList),
      metadata: {
        contextWindow: selected.contextWindow,
        latencyMs: 150, // Simulated baseline metadata latency
        capabilities: Object.freeze([...selected.capabilities])
      }
    };

    return this.deepFreeze(decision);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const promptModelRouter = new PromptModelRouter();
export default promptModelRouter;

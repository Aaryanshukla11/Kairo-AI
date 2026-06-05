import { RoutingDecisionModel } from './routingTypes';

export class RoutingDecision {
  public static create(
    selectedModelId: string,
    alternatives: string[],
    confidence: number,
    tps: number,
    capabilityScore: number,
    resourceScore: number,
    performanceScore: number
  ): RoutingDecisionModel {
    return {
      decisionId: `DEC-${Date.now()}`,
      timestamp: Date.now(),
      selectedModelId,
      alternatives,
      confidence,
      performanceEstimateTps: tps,
      factors: {
        capabilityMatchScore: capabilityScore,
        resourceScore,
        performanceScore
      }
    };
  }
}

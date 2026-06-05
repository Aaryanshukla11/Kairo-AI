import { RoutingRequest, RoutingDecisionModel, RoutingEventType, FallbackStrategy } from './routingTypes';
import { capabilityMatcher } from './capabilityMatcher';
import { resourceAnalyzer } from './resourceAnalyzer';
import { performanceAnalyzer } from './performanceAnalyzer';
import { modelScorer } from './modelScorer';
import { fallbackManager } from './fallbackManager';
import { RoutingDecision } from './routingDecision';
import { routingEvents } from './routingEvents';
import { routingHistory } from './routingHistory';
import { routingMetrics } from './routingMetrics';
import { CapabilityProvider } from './providers/capabilityProvider';
import { RegistryProvider } from './providers/registryProvider';
import { RuntimeProvider } from './providers/runtimeProvider';

export class RouterEngine {
  private capProv = new CapabilityProvider();
  private regProv = new RegistryProvider();
  private runProv = new RuntimeProvider();

  public async resolve(request: RoutingRequest): Promise<RoutingDecisionModel> {
    routingEvents.emit(RoutingEventType.RequestReceived);

    const candidates = this.regProv.getCandidates();
    routingEvents.emit(RoutingEventType.CandidatesCollected, { candidates });

    let bestModelId = '';
    let highestScore = -1.0;
    const scoredList: Array<{ id: string; score: number }> = [];

    for (const modelId of candidates) {
      const modelCaps = this.capProv.getCapabilities(modelId);
      const capResult = capabilityMatcher.match(modelCaps, request.requiredCapabilities);
      routingEvents.emit(RoutingEventType.CapabilitiesMatched, { modelId, capResult });

      const ram = this.runProv.getAvailableRamGb();
      const resourceResult = resourceAnalyzer.validateResources(8, ram);
      routingEvents.emit(RoutingEventType.ResourceValidated, { modelId, resourceResult });

      const perf = performanceAnalyzer.estimatePerformance(modelId);
      routingEvents.emit(RoutingEventType.PerformanceScored, { modelId, perf });

      if (capResult.match && resourceResult.ok) {
        const score = modelScorer.calculateScore(capResult.score, resourceResult.score, perf.tps);
        scoredList.push({ id: modelId, score });

        if (score > highestScore) {
          highestScore = score;
          bestModelId = modelId;
        }
      }
    }

    let fallbackTriggered = false;
    if (!bestModelId) {
      routingEvents.emit(RoutingEventType.FallbackTriggered);
      fallbackTriggered = true;
      bestModelId = fallbackManager.resolveFallback('', candidates, FallbackStrategy.NextBestModel);
    }

    const alternatives = candidates.filter(c => c !== bestModelId);
    const finalPerf = performanceAnalyzer.estimatePerformance(bestModelId);

    const decision = RoutingDecision.create(
      bestModelId,
      alternatives,
      highestScore >= 0 ? highestScore : 0.5,
      finalPerf.tps,
      1.0,
      1.0,
      1.0
    );

    routingHistory.logDecision(decision);
    routingMetrics.logRouting(fallbackTriggered);
    routingEvents.emit(RoutingEventType.DecisionMade, { decision });

    return decision;
  }
}

export const routerEngine = new RouterEngine();

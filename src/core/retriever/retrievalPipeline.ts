import { RetrievalRequest, RetrievedContext, RetrievalStrategyType, RetrieverEventType } from './retrieverTypes';
import { retrievalValidator } from './retrievalValidator';
import { retrievalCache } from './retrievalCache';
import { retrievalPlanner } from './retrievalPlanner';
import { rankingEngine } from './rankingEngine';
import { SemanticStrategy, KeywordStrategy, StructuralStrategy, HybridStrategy } from './strategies';
import { ProjectIndex } from '../indexer/indexTypes';
import { RetrieverEvents } from './retrieverEvents';

export class RetrievalPipeline {
  private semantic = new SemanticStrategy();
  private keyword = new KeywordStrategy();
  private structural = new StructuralStrategy();
  private hybrid = new HybridStrategy();

  /**
   * Orchestrates validators, cache lookups, strategies selection, and sorting pipelines.
   */
  public execute(request: RetrievalRequest, index: ProjectIndex, events: RetrieverEvents): RetrievedContext {
    retrievalValidator.validateRequest(request);

    const cached = retrievalCache.get(request.prompt, request.currentFile, request.filters);
    if (cached) {
      return cached;
    }

    events.emit(RetrieverEventType.RetrievalStarted, request.prompt);

    const strategy = retrievalPlanner.planRetrieval(request);

    let context: RetrievedContext;
    switch (strategy) {
      case RetrievalStrategyType.Semantic:
        context = this.semantic.retrieve(request, index);
        break;
      case RetrievalStrategyType.Keyword:
        context = this.keyword.retrieve(request, index);
        break;
      case RetrievalStrategyType.Structural:
        context = this.structural.retrieve(request, index);
        break;
      case RetrievalStrategyType.Hybrid:
      default:
        context = this.hybrid.retrieve(request, index);
        break;
    }

    context = rankingEngine.rerank(context, request.currentFile);
    events.emit(RetrieverEventType.ResultsRanked, request.prompt, { strategy });

    retrievalCache.set(request.prompt, request.currentFile, request.filters, context);

    events.emit(RetrieverEventType.RetrievalCompleted, request.prompt, { context });
    return context;
  }
}

export const retrievalPipeline = new RetrievalPipeline();

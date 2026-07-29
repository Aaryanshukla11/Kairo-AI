import { RetrievalRequest, RetrievalStrategyType } from './retrieverTypes';

export class RetrievalPlanner {
  /**
   * Resolves query features (lexical vs semantic properties) to select target strategy.
   */
  public planRetrieval(request: RetrievalRequest): RetrievalStrategyType {
    if (request.strategy) return request.strategy;

    const prompt = request.prompt.toLowerCase();
    if (prompt.includes('import') || prompt.includes('require') || prompt.includes('dependency')) {
      return RetrievalStrategyType.Structural;
    } else if (prompt.includes('find class') || prompt.includes('where is') || prompt.includes('symbol')) {
      return RetrievalStrategyType.Keyword;
    }

    return RetrievalStrategyType.Hybrid;
  }
}

export const retrievalPlanner = new RetrievalPlanner();

import { ContextItem, ContextPriority } from '../contextTypes';

export class RetrievalProvider {
  public collect(retrievals: any[]): ContextItem[] {
    return retrievals.map((ret, idx) => ({
      id: `ret-${idx}`,
      source: 'retrieval',
      content: `Retrieved segment: ${ret.content || ret}`,
      tokenCount: 20,
      priority: ContextPriority.High,
      score: 0.8
    }));
  }
}

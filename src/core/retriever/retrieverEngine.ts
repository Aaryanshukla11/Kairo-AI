import { RetrievalRequest, RetrievedContext, RetrieverEventType } from './retrieverTypes';
import { retrievalPipeline } from './retrievalPipeline';
import { ProjectIndex } from '../indexer/indexTypes';
import { RetrieverEvents } from './retrieverEvents';
import { retrievalCache } from './retrievalCache';

export class RetrieverEngine {
  private events = new RetrieverEvents();

  /**
   * Subscribes a listener to Retriever changes.
   */
  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public retrieveContext(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    this.events.emit(RetrieverEventType.RetrievalRequested, request.prompt);

    try {
      const context = retrievalPipeline.execute(request, index, this.events);
      return context;
    } catch (err: any) {
      this.events.emit(RetrieverEventType.RetrievalFailed, request.prompt, { error: err.message });
      throw err;
    }
  }

  public invalidateCache(): void {
    retrievalCache.invalidate();
  }
}

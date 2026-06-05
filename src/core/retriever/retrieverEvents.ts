import { RetrieverEvent, RetrieverEventListener, RetrieverEventType } from './retrieverTypes';

export class RetrieverEvents {
  private listeners = new Set<RetrieverEventListener>();

  /**
   * Subscribes a listener to Retriever Engine events.
   */
  public subscribe(listener: RetrieverEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts retrieval changes.
   */
  public emit(type: RetrieverEventType, prompt: string, payload?: any): void {
    const event: RetrieverEvent = {
      type,
      prompt,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in retriever event listener:', err);
      }
    }
  }
}

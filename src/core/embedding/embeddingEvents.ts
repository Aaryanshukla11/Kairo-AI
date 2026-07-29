import { EmbeddingEvent, EmbeddingEventListener, EmbeddingEventType } from './embeddingTypes';

export class EmbeddingEvents {
  private listeners = new Set<EmbeddingEventListener>();

  /**
   * Subscribes a listener to Embedding Engine events.
   */
  public subscribe(listener: EmbeddingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts embedding event changes.
   */
  public emit(type: EmbeddingEventType, sourceId: string, payload?: any): void {
    const event: EmbeddingEvent = {
      type,
      sourceId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in embedding event listener:', err);
      }
    }
  }
}

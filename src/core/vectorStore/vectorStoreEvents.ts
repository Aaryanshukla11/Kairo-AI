import { VectorStoreEvent, VectorStoreEventListener, VectorStoreEventType } from './vectorStoreTypes';

export class VectorStoreEvents {
  private listeners = new Set<VectorStoreEventListener>();

  /**
   * Subscribes a listener to Vector Store events.
   */
  public subscribe(listener: VectorStoreEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts vector changes.
   */
  public emit(type: VectorStoreEventType, vectorId?: string, payload?: any): void {
    const event: VectorStoreEvent = {
      type,
      vectorId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in vector store event listener:', err);
      }
    }
  }
}

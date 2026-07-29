import { ContextEvent, ContextEventListener, ContextEventType } from './contextTypes';

export class ContextEvents {
  private listeners = new Set<ContextEventListener>();

  /**
   * Subscribes a listener to Context Engine events.
   */
  public subscribe(listener: ContextEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts context events to all active listeners.
   */
  public emit(type: ContextEventType, contextId: string, payload?: any): void {
    const event: ContextEvent = {
      type,
      contextId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in context event listener:', err);
      }
    }
  }
}

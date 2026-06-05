import { RollbackEvent, RollbackEventListener, RollbackEventType } from './rollbackTypes';

export class RollbackEvents {
  private listeners = new Set<RollbackEventListener>();

  /**
   * Subscribes a listener to Rollback events.
   */
  public subscribe(listener: RollbackEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts Rollback events to all subscribers.
   */
  public emit(type: RollbackEventType, rollbackId: string, payload?: any): void {
    const event: RollbackEvent = {
      type,
      rollbackId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Rollback event listener:', err);
      }
    }
  }
}

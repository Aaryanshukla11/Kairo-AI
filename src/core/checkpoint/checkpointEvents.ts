import { CheckpointEvent, CheckpointEventListener, CheckpointEventType } from './checkpointTypes';

export class CheckpointEvents {
  private listeners = new Set<CheckpointEventListener>();

  /**
   * Subscribes a listener to Checkpoint events.
   */
  public subscribe(listener: CheckpointEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts checkpoint events to all listeners.
   */
  public emit(type: CheckpointEventType, checkpointId: string, payload?: any): void {
    const event: CheckpointEvent = {
      type,
      checkpointId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Checkpoint event listener:', err);
      }
    }
  }
}

import { ExecutorEvent, ExecutorEventListener, ExecutorEventType } from './executorTypes';

export class ExecutionEvents {
  private listeners = new Set<ExecutorEventListener>();

  /**
   * Subscribes a listener to Executor Agent events.
   */
  public subscribe(listener: ExecutorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts executor events.
   */
  public emit(type: ExecutorEventType, payload?: any): void {
    const event: ExecutorEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in executor event listener:', err);
      }
    }
  }
}

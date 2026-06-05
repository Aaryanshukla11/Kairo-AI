import { RuntimeEvent, RuntimeEventListener, RuntimeEventType } from './runtimeTypes';

export class RuntimeEvents {
  private listeners = new Set<RuntimeEventListener>();

  /**
   * Subscribes a listener to Model Runtime events.
   */
  public subscribe(listener: RuntimeEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts model and inference changes.
   */
  public emit(type: RuntimeEventType, modelId: string, payload?: any): void {
    const event: RuntimeEvent = {
      type,
      modelId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in model runtime event listener:', err);
      }
    }
  }
}

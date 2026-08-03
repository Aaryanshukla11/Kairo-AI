import { CollectorEvent, CollectorEventListener, CollectorEventType } from './collectorTypes';

export class CollectorEvents {
  private listeners = new Set<CollectorEventListener>();

  public subscribe(listener: CollectorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: CollectorEventType, payload?: any): CollectorEvent {
    const event: CollectorEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in dataset collector event listener:', err);
      }
    }
    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const collectorEvents = new CollectorEvents();

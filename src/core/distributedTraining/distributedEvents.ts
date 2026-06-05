import { DistributedEvent, DistributedEventListener, DistributedEventType } from './distributedTypes';

export class DistributedEvents {
  private listeners = new Set<DistributedEventListener>();

  public subscribe(listener: DistributedEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DistributedEventType, payload?: any): DistributedEvent {
    const event: DistributedEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in distributed event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const distributedEvents = new DistributedEvents();
export default distributedEvents;

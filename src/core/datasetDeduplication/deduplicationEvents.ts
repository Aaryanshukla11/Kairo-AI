import { DeduplicationEvent, DeduplicationEventListener, DeduplicationEventType } from './deduplicationTypes';

export class DeduplicationEvents {
  private listeners = new Set<DeduplicationEventListener>();

  public subscribe(listener: DeduplicationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DeduplicationEventType, payload?: any): DeduplicationEvent {
    const event: DeduplicationEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in deduplication event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const deduplicationEvents = new DeduplicationEvents();
export default deduplicationEvents;

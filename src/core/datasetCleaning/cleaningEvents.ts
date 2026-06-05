import { CleaningEvent, CleaningEventListener, CleaningEventType } from './cleaningTypes';

export class CleaningEvents {
  private listeners = new Set<CleaningEventListener>();

  public subscribe(listener: CleaningEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: CleaningEventType, payload?: any): CleaningEvent {
    const event: CleaningEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in cleaning event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const cleaningEvents = new CleaningEvents();

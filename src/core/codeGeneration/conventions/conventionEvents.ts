import { ConventionEvent, ConventionEventType, ConventionEventListener } from './conventionTypes';

export class ConventionEvents {
  private listeners = new Set<ConventionEventListener>();

  public subscribe(listener: ConventionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ConventionEventType, payload?: any): void {
    const event: ConventionEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Project Convention Engine event listener:', err);
      }
    }
  }
}

export const conventionEvents = new ConventionEvents();

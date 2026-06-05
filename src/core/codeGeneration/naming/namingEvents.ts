import { NamingEvent, NamingEventType, NamingEventListener } from './namingTypes';

export class NamingEvents {
  private listeners = new Set<NamingEventListener>();

  public subscribe(listener: NamingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: NamingEventType, payload?: any): void {
    const event: NamingEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Naming Intelligence Engine event listener:', err);
      }
    }
  }
}

export const namingEvents = new NamingEvents();

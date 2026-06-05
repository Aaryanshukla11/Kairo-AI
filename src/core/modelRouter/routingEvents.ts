import { RoutingEvent, RoutingEventListener, RoutingEventType } from './routingTypes';

export class RoutingEvents {
  private listeners = new Set<RoutingEventListener>();

  public subscribe(listener: RoutingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: RoutingEventType, payload?: any): void {
    const event: RoutingEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in model router event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const routingEvents = new RoutingEvents();

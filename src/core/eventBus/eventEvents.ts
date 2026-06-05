export type EventBusListener = (event: any) => void;

export class EventEvents {
  private listeners = new Set<EventBusListener>();

  public subscribe(listener: EventBusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload?: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error('Error in EventBus listener:', err);
      }
    }
  }
}
export const eventEvents = new EventEvents();

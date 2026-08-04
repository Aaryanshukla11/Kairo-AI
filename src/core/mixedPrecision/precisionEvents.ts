import { PrecisionEvent, PrecisionEventListener, PrecisionEventType } from './precisionTypes';

export class PrecisionEvents {
  private listeners = new Set<PrecisionEventListener>();

  public subscribe(listener: PrecisionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: PrecisionEventType, payload?: any): PrecisionEvent {
    const event: PrecisionEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in precision event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const precisionEvents = new PrecisionEvents();
export default precisionEvents;

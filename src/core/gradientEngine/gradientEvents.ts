import { GradientEvent, GradientEventListener, GradientEventType } from './gradientTypes';

export class GradientEvents {
  private listeners = new Set<GradientEventListener>();

  public subscribe(listener: GradientEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: GradientEventType, payload?: any): GradientEvent {
    const event: GradientEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in gradient event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const gradientEvents = new GradientEvents();
export default gradientEvents;

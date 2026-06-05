import { PerformanceEvent, PerformanceEventType, PerformanceEventListener } from './performanceTypes';

export class PerformanceEvents {
  private listeners = new Set<PerformanceEventListener>();

  public subscribe(listener: PerformanceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: PerformanceEventType, payload?: any): void {
    const event: PerformanceEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Performance Agent event listener:', err);
      }
    }
  }
}

import { OptimizationEvent, OptimizationEventListener, OptimizationEventType } from './optimizationTypes';

export class OptimizationEvents {
  private listeners = new Set<OptimizationEventListener>();

  public subscribe(listener: OptimizationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: OptimizationEventType, payload?: any): void {
    const event: OptimizationEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in runtime optimizer event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const optimizationEvents = new OptimizationEvents();

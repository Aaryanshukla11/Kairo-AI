import { DepEvent, DepEventType, DepEventListener } from './dependencyTypes';

export class DependencyEvents {
  private listeners = new Set<DepEventListener>();

  public subscribe(listener: DepEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DepEventType, payload?: any): void {
    const event: DepEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Dependency Agent event listener:', err);
      }
    }
  }
}

import { ContextEvent, ContextEventListener, ContextEventType } from './contextTypes';

export class ContextEvents {
  private listeners = new Set<ContextEventListener>();

  public subscribe(listener: ContextEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ContextEventType, payload?: any): void {
    const event: ContextEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in context window event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const contextEvents = new ContextEvents();

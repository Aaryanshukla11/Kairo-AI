import { MemoryEvent, MemoryEventType, MemoryEventListener } from './memoryTypes';

export class MemoryEvents {
  private listeners = new Set<MemoryEventListener>();

  public subscribe(listener: MemoryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: MemoryEventType, payload?: any): void {
    const event: MemoryEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Memory Agent event listener:', err);
      }
    }
  }
}

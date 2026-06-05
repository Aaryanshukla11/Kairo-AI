import { ArchEvent, ArchEventType, ArchEventListener } from './architectureTypes';

export class ArchitectureEvents {
  private listeners = new Set<ArchEventListener>();

  public subscribe(listener: ArchEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ArchEventType, payload?: any): void {
    const event: ArchEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Architecture Agent event listener:', err);
      }
    }
  }
}

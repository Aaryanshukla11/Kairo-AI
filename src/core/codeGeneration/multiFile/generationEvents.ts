import { MultiFileEvent, MultiFileEventType, MultiFileEventListener } from './generationTypes';

export class MultiFileEvents {
  private listeners = new Set<MultiFileEventListener>();

  public subscribe(listener: MultiFileEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: MultiFileEventType, payload?: any): void {
    const event: MultiFileEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Multi-file Generation Engine event listener:', err);
      }
    }
  }
}

export const multiFileEvents = new MultiFileEvents();

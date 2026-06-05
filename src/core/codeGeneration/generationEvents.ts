import { GenEvent, GenEventType, GenEventListener } from './generationTypes';

export class GenerationEvents {
  private listeners = new Set<GenEventListener>();

  public subscribe(listener: GenEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: GenEventType, payload?: any): void {
    const event: GenEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Code Generation Engine event listener:', err);
      }
    }
  }
}

export const generationEvents = new GenerationEvents();

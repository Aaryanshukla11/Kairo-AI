import { SymbolEvent, SymbolEventType, SymbolEventListener } from './symbolTypes';

export class SymbolEvents {
  private listeners = new Set<SymbolEventListener>();

  public subscribe(listener: SymbolEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: SymbolEventType, payload?: any): void {
    const event: SymbolEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Symbol Resolution Engine event listener:', err);
      }
    }
  }
}

export const symbolEvents = new SymbolEvents();

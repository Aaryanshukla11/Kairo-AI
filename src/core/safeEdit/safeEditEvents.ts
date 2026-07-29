import { SafeEditEvent, SafeEditEventType, SafeEditEventListener } from './safeEditTypes';

export class SafeEditEvents {
  private listeners = new Set<SafeEditEventListener>();

  public subscribe(listener: SafeEditEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: SafeEditEventType, payload?: any): void {
    const event: SafeEditEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Safe Edit Engine event listener:', err);
      }
    }
  }
}

export const safeEditEvents = new SafeEditEvents();

import { DebugEvent, DebugEventType, DebugEventListener } from './debugTypes';

export class DebugEvents {
  private listeners = new Set<DebugEventListener>();

  public subscribe(listener: DebugEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DebugEventType, payload?: any): void {
    const event: DebugEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Debug Agent event listener:', err);
      }
    }
  }
}

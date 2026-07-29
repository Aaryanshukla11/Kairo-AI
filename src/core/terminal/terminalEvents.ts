import { TerminalEvent, TerminalEventListener, TerminalEventType } from './terminalTypes';

export class TerminalEvents {
  private listeners = new Set<TerminalEventListener>();

  /**
   * Subscribes to terminal events.
   */
  public subscribe(listener: TerminalEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts terminal event.
   */
  public emit(type: TerminalEventType, commandId: string, payload?: any): void {
    const event: TerminalEvent = {
      type,
      commandId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in terminal event listener:', err);
      }
    }
  }
}

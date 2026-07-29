import { ToolCallingEvent, ToolCallingEventListener, ToolCallingEventType } from './toolTypes';

export class ToolEvents {
  private listeners = new Set<ToolCallingEventListener>();

  /**
   * Subscribes a listener to Tool Calling events.
   */
  public subscribe(listener: ToolCallingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts tool status changes.
   */
  public emit(type: ToolCallingEventType, toolId: string, payload?: any): void {
    const event: ToolCallingEvent = {
      type,
      toolId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in tool calling event listener:', err);
      }
    }
  }
}

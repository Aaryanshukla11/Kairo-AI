import { PromptAssemblyEvent, PromptAssemblyEventListener, PromptAssemblyEventType, PromptType } from './promptTypes';

export class PromptAssemblyEvents {
  private listeners = new Set<PromptAssemblyEventListener>();

  /**
   * Subscribes a listener to Prompt Assembly events.
   */
  public subscribe(listener: PromptAssemblyEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts prompt status changes.
   */
  public emit(type: PromptAssemblyEventType, promptType: PromptType, payload?: any): void {
    const event: PromptAssemblyEvent = {
      type,
      promptType,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in prompt assembly event listener:', err);
      }
    }
  }
}

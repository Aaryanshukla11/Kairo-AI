import { PromptCompilerEvent, PromptCompilerEventListener, PromptCompilerEventType } from './promptTypes';

export class PromptEvents {
  private listeners = new Set<PromptCompilerEventListener>();

  public subscribe(listener: PromptCompilerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: PromptCompilerEventType, payload?: any): void {
    const event: PromptCompilerEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in prompt compiler event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const promptEvents = new PromptEvents();

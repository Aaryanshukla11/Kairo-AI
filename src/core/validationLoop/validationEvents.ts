import { ValidationLoopEvent, ValidationLoopEventListener, ValidationLoopEventType } from './validationTypes';

export class ValidationEvents {
  private listeners = new Set<ValidationLoopEventListener>();

  public subscribe(listener: ValidationLoopEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ValidationLoopEventType, payload?: any): ValidationLoopEvent {
    const event: ValidationLoopEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in validation event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const validationEvents = new ValidationEvents();
export default validationEvents;

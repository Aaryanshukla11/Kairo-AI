import { ValidationEvent, ValidationEventType, ValidationEventListener } from './validationTypes';

export class ValidationEvents {
  private listeners = new Set<ValidationEventListener>();

  public subscribe(listener: ValidationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ValidationEventType, payload?: any): void {
    const event: ValidationEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Validation Engine event listener:', err);
      }
    }
  }
}

export const validationEvents = new ValidationEvents();

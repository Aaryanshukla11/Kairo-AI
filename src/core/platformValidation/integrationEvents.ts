import { PlatformValidationEvent, PlatformValidationEventType } from './validationTypes';

export type IntegrationListener = (event: PlatformValidationEvent) => void;

export class IntegrationEvents {
  private listeners = new Set<IntegrationListener>();

  public subscribe(listener: IntegrationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(type: PlatformValidationEventType, payload: any): void {
    const event: PlatformValidationEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in IntegrationEvents listener:', err);
      }
    }
  }
}

export const integrationEvents = new IntegrationEvents();

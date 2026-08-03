import { InferenceEvent, InferenceEventListener, InferenceEventType } from './inferenceTypes';

export class InferenceEvents {
  private listeners = new Set<InferenceEventListener>();

  public subscribe(listener: InferenceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: InferenceEventType, sessionId: string, payload?: any): void {
    const event: InferenceEvent = {
      type,
      sessionId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in inference pipeline event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const inferenceEvents = new InferenceEvents();

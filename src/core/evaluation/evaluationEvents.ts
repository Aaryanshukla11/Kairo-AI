import { EvaluationEvent, EvaluationEventListener, EvaluationEventType } from './evaluationTypes';

export class EvaluationEvents {
  private listeners = new Set<EvaluationEventListener>();

  public subscribe(listener: EvaluationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: EvaluationEventType, payload?: any): EvaluationEvent {
    const event: EvaluationEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in evaluation event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const evaluationEvents = new EvaluationEvents();
export default evaluationEvents;

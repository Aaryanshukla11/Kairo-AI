import { ExperimentEvent, ExperimentEventListener, ExperimentEventType } from './experimentTypes';

export class ExperimentEvents {
  private listeners = new Set<ExperimentEventListener>();

  public subscribe(listener: ExperimentEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ExperimentEventType, payload?: any): ExperimentEvent {
    const event: ExperimentEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in experiment event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const experimentEvents = new ExperimentEvents();
export default experimentEvents;

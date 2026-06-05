import { TrainingEvent, TrainingEventListener, TrainingEventType } from './trainingTypes';

export class TrainingEvents {
  private listeners = new Set<TrainingEventListener>();

  public subscribe(listener: TrainingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: TrainingEventType, payload?: any): TrainingEvent {
    const event: TrainingEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in training event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const trainingEvents = new TrainingEvents();
export default trainingEvents;

import { FineTuningEvent, FineTuningEventListener } from './fineTuningTypes';

export class FineTuningEvents {
  private listeners: Set<FineTuningEventListener> = new Set();

  public subscribe(listener: FineTuningEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: FineTuningEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in fine-tuning event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const fineTuningEvents = new FineTuningEvents();
export default fineTuningEvents;

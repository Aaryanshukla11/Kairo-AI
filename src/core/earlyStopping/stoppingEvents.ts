import { EarlyStoppingEvent, EarlyStoppingEventListener } from './stoppingTypes';

export class StoppingEvents {
  private listeners: Set<EarlyStoppingEventListener> = new Set();

  public subscribe(listener: EarlyStoppingEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: EarlyStoppingEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in early stopping event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const stoppingEvents = new StoppingEvents();
export default stoppingEvents;

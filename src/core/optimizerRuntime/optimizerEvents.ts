import { OptimizerEvent, OptimizerEventListener, OptimizerEventType } from './optimizerTypes';

export class OptimizerEvents {
  private listeners = new Set<OptimizerEventListener>();

  public subscribe(listener: OptimizerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: OptimizerEventType, payload?: any): OptimizerEvent {
    const event: OptimizerEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in optimizer event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const optimizerEvents = new OptimizerEvents();
export default optimizerEvents;

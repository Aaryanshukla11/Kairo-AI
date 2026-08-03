import { CheckpointEvent, CheckpointEventListener, CheckpointEventType } from './checkpointTypes';

export class CheckpointEvents {
  private listeners = new Set<CheckpointEventListener>();

  public subscribe(listener: CheckpointEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: CheckpointEventType, payload?: any): CheckpointEvent {
    const event: CheckpointEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in checkpoint event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const checkpointEvents = new CheckpointEvents();
export default checkpointEvents;

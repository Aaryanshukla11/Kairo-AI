import { EditEvent, EditEventType, EditEventListener } from './editTypes';

export class EditEvents {
  private listeners = new Set<EditEventListener>();

  public subscribe(listener: EditEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: EditEventType, payload?: any): void {
    const event: EditEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Incremental Edit Engine event listener:', err);
      }
    }
  }
}

export const editEvents = new EditEvents();

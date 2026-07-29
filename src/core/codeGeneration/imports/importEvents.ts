import { ImportEvent, ImportEventType, ImportEventListener } from './importTypes';

export class ImportEvents {
  private listeners = new Set<ImportEventListener>();

  public subscribe(listener: ImportEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ImportEventType, payload?: any): void {
    const event: ImportEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Import Resolution Engine event listener:', err);
      }
    }
  }
}

export const importEvents = new ImportEvents();

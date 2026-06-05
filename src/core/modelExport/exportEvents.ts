import { ExportEvent, ExportEventListener } from './exportTypes';

export class ExportEvents {
  private listeners: Set<ExportEventListener> = new Set();

  public subscribe(listener: ExportEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: ExportEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in model export event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const exportEvents = new ExportEvents();
export default exportEvents;

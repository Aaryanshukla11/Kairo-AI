import { DatasetBuilderEvent, DatasetBuilderEventListener, DatasetBuilderEventType } from './datasetTypes';

export class DatasetEvents {
  private listeners = new Set<DatasetBuilderEventListener>();

  public subscribe(listener: DatasetBuilderEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DatasetBuilderEventType, payload?: any): void {
    const event: DatasetBuilderEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in dataset builder event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const datasetEvents = new DatasetEvents();

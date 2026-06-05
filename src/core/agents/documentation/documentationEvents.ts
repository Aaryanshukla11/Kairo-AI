import { DocEvent, DocEventType, DocEventListener } from './documentationTypes';

export class DocumentationEvents {
  private listeners = new Set<DocEventListener>();

  public subscribe(listener: DocEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DocEventType, payload?: any): void {
    const event: DocEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Documentation Agent event listener:', err);
      }
    }
  }
}

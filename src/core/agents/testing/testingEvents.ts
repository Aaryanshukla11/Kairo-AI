import { TestingEvent, TestingEventType, TestingEventListener } from './testingTypes';

export class TestingEvents {
  private listeners = new Set<TestingEventListener>();

  public subscribe(listener: TestingEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: TestingEventType, payload?: any): void {
    const event: TestingEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Testing Agent event listener:', err);
      }
    }
  }
}

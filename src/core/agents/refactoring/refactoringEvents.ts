import { RefactorEvent, RefactorEventType, RefactorEventListener } from './refactoringTypes';

export class RefactoringEvents {
  private listeners = new Set<RefactorEventListener>();

  public subscribe(listener: RefactorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: RefactorEventType, payload?: any): void {
    const event: RefactorEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Refactoring Agent event listener:', err);
      }
    }
  }
}
export const refactoringEvents = new RefactoringEvents();

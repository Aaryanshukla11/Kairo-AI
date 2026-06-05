import { ReviewerEvent, ReviewerEventListener, ReviewerEventType } from './reviewerTypes';

export class ReviewerEvents {
  private listeners = new Set<ReviewerEventListener>();

  /**
   * Subscribes a listener to Reviewer Agent events.
   */
  public subscribe(listener: ReviewerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts reviewer events.
   */
  public emit(type: ReviewerEventType, payload?: any): void {
    const event: ReviewerEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in reviewer event listener:', err);
      }
    }
  }
}

import { ReviewEvent, ReviewEventType, ReviewEventListener } from './reviewTypes';

export class ReviewEvents {
  private listeners = new Set<ReviewEventListener>();

  public subscribe(listener: ReviewEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ReviewEventType, payload?: any): void {
    const event: ReviewEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Self Review Engine event listener:', err);
      }
    }
  }
}

export const reviewEvents = new ReviewEvents();

import { PlannerEvent, PlannerEventListener, PlannerEventType } from './plannerTypes';

export class PlannerEvents {
  private listeners = new Set<PlannerEventListener>();

  /**
   * Subscribes a listener to Planner Agent events.
   */
  public subscribe(listener: PlannerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts planning events.
   */
  public emit(type: PlannerEventType, payload?: any): void {
    const event: PlannerEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in planner event listener:', err);
      }
    }
  }
}

import { PermissionEvent, PermissionEventListener, PermissionEventType } from './permissionTypes';

export class PermissionEvents {
  private listeners = new Set<PermissionEventListener>();

  /**
   * Subscribes a listener to permission events.
   */
  public subscribe(listener: PermissionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts permission events to all subscribers.
   */
  public emit(type: PermissionEventType, requestId: string, payload?: any): void {
    const event: PermissionEvent = {
      type,
      requestId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in permission event listener:', err);
      }
    }
  }
}

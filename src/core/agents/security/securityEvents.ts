import { SecurityEvent, SecurityEventType, SecurityEventListener } from './securityTypes';

export class SecurityEvents {
  private listeners = new Set<SecurityEventListener>();

  public subscribe(listener: SecurityEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: SecurityEventType, payload?: any): void {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Security Agent event listener:', err);
      }
    }
  }
}

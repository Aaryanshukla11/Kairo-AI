import { VersionEvent, VersionEventListener, VersionEventType } from './versionTypes';

export class VersionEvents {
  private listeners = new Set<VersionEventListener>();

  public subscribe(listener: VersionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: VersionEventType, payload?: any): VersionEvent {
    const event: VersionEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in versioning event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const versionEvents = new VersionEvents();
export default versionEvents;

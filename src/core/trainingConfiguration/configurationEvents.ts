import { ConfigEvent, ConfigEventListener, ConfigEventType } from './configurationTypes';

export class ConfigurationEvents {
  private listeners = new Set<ConfigEventListener>();

  public subscribe(listener: ConfigEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ConfigEventType, payload?: any): ConfigEvent {
    const event: ConfigEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in configuration event listener:', err);
      }
    }

    return event;
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const configurationEvents = new ConfigurationEvents();
export default configurationEvents;

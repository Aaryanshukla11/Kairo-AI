import { RegistryEvent, RegistryEventListener, RegistryEventType } from './registryTypes';

export class RegistryEvents {
  private listeners = new Set<RegistryEventListener>();

  public subscribe(listener: RegistryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: RegistryEventType, modelId?: string, payload?: any): void {
    const event: RegistryEvent = {
      type,
      modelId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in model registry event listener:', err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const registryEvents = new RegistryEvents();

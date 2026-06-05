import { IEventBus } from '../interfaces';

export interface CodeGenEvent<T = any> {
  type: string;
  timestamp: number;
  payload: T;
}

export class CodeGenEventBus implements IEventBus {
  private listeners = new Map<string, Set<(payload: any) => void>>();

  public publish<T = any>(eventType: string, payload: T): void {
    const event: CodeGenEvent<T> = {
      type: eventType,
      timestamp: Date.now(),
      payload
    };

    const targets = this.listeners.get(eventType);
    if (targets) {
      for (const listener of targets) {
        try {
          listener(event);
        } catch (err) {
          console.error(`[EventBus] Error dispatching event '${eventType}':`, err);
        }
      }
    }
  }

  public subscribe<T = any>(eventType: string, listener: (event: CodeGenEvent<T>) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const set = this.listeners.get(eventType)!;
    set.add(listener);

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }
}

export const eventBus = new CodeGenEventBus();
export default eventBus;

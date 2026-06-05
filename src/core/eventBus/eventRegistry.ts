import { AIIdleEvent } from './eventTypes';

export type EventSubscriberCallback = (event: AIIdleEvent) => Promise<void>;

export class EventRegistry {
  private subscribers = new Map<string, Set<EventSubscriberCallback>>();

  public subscribe(category: string, callback: EventSubscriberCallback): () => void {
    if (!this.subscribers.has(category)) {
      this.subscribers.set(category, new Set());
    }
    this.subscribers.get(category)!.add(callback);
    return () => {
      this.subscribers.get(category)?.delete(callback);
    };
  }

  public getSubscribers(category: string): EventSubscriberCallback[] {
    const subs = this.subscribers.get(category);
    return subs ? Array.from(subs) : [];
  }
}
export const eventRegistry = new EventRegistry();

import { eventRegistry, EventSubscriberCallback } from './eventRegistry';

export class EventSubscriber {
  public subscribe(category: string, callback: EventSubscriberCallback): () => void {
    return eventRegistry.subscribe(category, callback);
  }
}
export const eventSubscriber = new EventSubscriber();

import { AIIdleEvent } from './eventTypes';
import { eventRegistry } from './eventRegistry';

export class EventDispatcher {
  public async dispatch(event: AIIdleEvent): Promise<void> {
    const subs = eventRegistry.getSubscribers(event.category);
    const promises = subs.map(async (sub) => {
      try {
        await sub(event);
      } catch (err) {
        console.error(`Error executing subscriber on event ${event.eventId}:`, err);
        throw err;
      }
    });
    await Promise.all(promises);
  }
}
export const eventDispatcher = new EventDispatcher();

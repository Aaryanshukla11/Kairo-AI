import { AIIdleEvent } from './eventTypes';
import { eventDispatcher } from './eventDispatcher';

export class EventRouter {
  public async route(event: AIIdleEvent): Promise<void> {
    await eventDispatcher.dispatch(event);
  }
}
export const eventRouter = new EventRouter();

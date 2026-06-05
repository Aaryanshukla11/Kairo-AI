import { AIIdleEvent } from '../eventTypes';

export class LoggingMiddleware {
  public async handle(event: AIIdleEvent, next: () => Promise<void>): Promise<void> {
    console.log(`[EventBus Log] Event ${event.eventId} published on category ${event.category}`);
    await next();
  }
}
export const loggingMiddleware = new LoggingMiddleware();

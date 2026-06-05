import { AIIdleEvent } from '../eventTypes';

export class TracingMiddleware {
  public async handle(event: AIIdleEvent, next: () => Promise<void>): Promise<void> {
    event.metadata['traceId'] = event.metadata['traceId'] || `trace-${Math.random().toString(36).substr(2, 9)}`;
    await next();
  }
}
export const tracingMiddleware = new TracingMiddleware();

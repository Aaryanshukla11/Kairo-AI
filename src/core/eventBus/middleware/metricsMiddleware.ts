import { AIIdleEvent } from '../eventTypes';
import { eventMetrics } from '../eventMetrics';

export class MetricsMiddleware {
  public async handle(event: AIIdleEvent, next: () => Promise<void>): Promise<void> {
    const start = Date.now();
    await next();
    eventMetrics.record(Date.now() - start);
  }
}
export const metricsMiddleware = new MetricsMiddleware();

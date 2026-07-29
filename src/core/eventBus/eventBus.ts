import { AIIdleEvent, DeliveryGuarantee } from './eventTypes';
import { eventRouter } from './eventRouter';
import { eventPersistence } from './eventPersistence';
import { deadLetterQueue } from './deadLetterQueue';
import { retryManager } from './retryManager';
import { eventEvents } from './eventEvents';

// Middleware imports
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { tracingMiddleware } from './middleware/tracingMiddleware';
import { authorizationMiddleware } from './middleware/authorizationMiddleware';

export class EventBus {
  private guarantee: DeliveryGuarantee = 'At Least Once';

  public setDeliveryGuarantee(guarantee: DeliveryGuarantee): void {
    this.guarantee = guarantee;
  }

  public async publish(event: AIIdleEvent): Promise<void> {
    eventEvents.emit('EventPublished', event);

    // Middleware Pipeline: Authorization -> Logging -> Tracing -> Metrics -> Dispatch
    const pipeline = async () => {
      await authorizationMiddleware.handle(event, async () => {
        await loggingMiddleware.handle(event, async () => {
          await tracingMiddleware.handle(event, async () => {
            await metricsMiddleware.handle(event, async () => {
              await this.executeDispatch(event);
            });
          });
        });
      });
    };

    try {
      await pipeline();
      eventPersistence.save(event);
    } catch (err: any) {
      console.error(`Event ${event.eventId} pipeline failure:`, err);
      // Retry Strategy
      if (retryManager.shouldRetry(event)) {
        event.retryCount++;
        event.executionStatus = 'Retrying';
        const delay = retryManager.getBackoffDelay(event.retryCount);
        eventEvents.emit('EventRetrying', { eventId: event.eventId, attempt: event.retryCount, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.publish(event);
      } else {
        event.executionStatus = 'Failed';
        deadLetterQueue.add(event, err.message || 'Maximum retry limit exceeded');
        eventEvents.emit('EventDeadLettered', { eventId: event.eventId, reason: err.message });
      }
    }
  }

  private async executeDispatch(event: AIIdleEvent): Promise<void> {
    event.executionStatus = 'Running';
    await eventRouter.route(event);
    event.executionStatus = 'Completed';
    eventEvents.emit('EventDispatched', event);
  }
}
export const eventBusInstance = new EventBus();

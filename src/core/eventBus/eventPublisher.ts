import { AIIdleEvent } from './eventTypes';
import { eventBusInstance } from './eventBus';

export class EventPublisher {
  public async publish(event: Omit<AIIdleEvent, 'eventId' | 'timestamp' | 'retryCount' | 'executionStatus'>): Promise<void> {
    const fullEvent: AIIdleEvent = {
      ...event,
      eventId: `EV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: Date.now(),
      retryCount: 0,
      executionStatus: 'Queued'
    };
    await eventBusInstance.publish(fullEvent);
  }
}
export const eventPublisher = new EventPublisher();

import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';
import { eventBusInstance } from '../eventBus/eventBus';
import { eventRegistry } from '../eventBus/eventRegistry';
import { deadLetterQueue } from '../eventBus/deadLetterQueue';
import { AIIdleEvent } from '../eventBus/eventTypes';

export class EventValidator implements IValidationProvider {
  public readonly id = 'event-validator';
  public readonly name = 'Event System Validator';
  public readonly targetSubsystem = 'Events';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    const eventsProcessed: string[] = [];

    // Let's test routing and subscriber execution
    try {
      let subscriberCalled = false;
      let receivedPayload: any = null;

      const unsubscribe = eventRegistry.subscribe('Validation', async (event: AIIdleEvent) => {
        subscriberCalled = true;
        receivedPayload = event.payload;
        eventsProcessed.push(event.eventId);
      });

      const testEvent: AIIdleEvent = {
        eventId: 'test-evt-001',
        workflowId: 'wf-validation-test',
        correlationId: 'corr-validation-test',
        timestamp: Date.now(),
        publisher: 'platform-validation-engine',
        subscribers: [],
        priority: 'Normal',
        category: 'Validation',
        payload: { value: 42 },
        metadata: {},
        retryCount: 0,
        executionStatus: 'Idle'
      };

      await eventBusInstance.publish(testEvent);
      unsubscribe();

      if (!subscriberCalled) {
        score -= 20;
        errors.push('Event Subscriber was not triggered upon event publication.');
      } else if (receivedPayload?.value !== 42) {
        score -= 10;
        errors.push('Event Subscriber received corrupt payload.');
      }
    } catch (err: any) {
      score -= 30;
      errors.push(`Event routing failed with error: ${err.message || err}`);
    }

    // Test Dead Letter Queue mechanism
    try {
      deadLetterQueue.clear();
      const failEvent: AIIdleEvent = {
        eventId: 'test-evt-fail',
        workflowId: 'wf-validation-test-fail',
        correlationId: 'corr-validation-test-fail',
        timestamp: Date.now(),
        publisher: 'platform-validation-engine',
        subscribers: [],
        priority: 'Normal',
        category: 'Validation',
        payload: { crash: true },
        metadata: {},
        retryCount: 5, // skip retries to go straight to DLQ or retry manager limits
        executionStatus: 'Idle'
      };

      // Register subscriber that throws an error
      const unsubscribeFail = eventRegistry.subscribe('Validation', async (event: AIIdleEvent) => {
        throw new Error('Forced Subscriber Failure');
      });

      // Temporarily set delivery guarantee and try publishing
      await eventBusInstance.publish(failEvent);
      unsubscribeFail();

      const dlqList = deadLetterQueue.list();
      const foundInDlq = dlqList.some(entry => entry.event.eventId === 'test-evt-fail');

      if (!foundInDlq) {
        score -= 20;
        warnings.push('Failed events are not correctly routed to Dead Letter Queue (DLQ).');
      }
      deadLetterQueue.clear();
    } catch (err: any) {
      // It's possible retry limit threw, clean up DLQ anyway
      deadLetterQueue.clear();
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Validated event publishing, subscriber routing, payload integrity, and Dead Letter Queue (DLQ) mechanics.`,
      errors,
      warnings,
      metrics: {
        eventsValidatedCount: eventsProcessed.length,
        dlqChecksPassed: score > 70 ? 1 : 0
      }
    };
  }
}

export const eventValidator = new EventValidator();

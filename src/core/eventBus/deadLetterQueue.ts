import { DeadLetterEntry, AIIdleEvent } from './eventTypes';

export class DeadLetterQueue {
  private queue: DeadLetterEntry[] = [];

  public add(event: AIIdleEvent, reason: string): void {
    this.queue.push({
      event,
      failureReason: reason,
      retryAttempts: event.retryCount,
      workflowContext: {},
      recoveryRecommendation: 'Check subscriber callback validation limits or configurations.'
    });
  }

  public list(): DeadLetterEntry[] {
    return [...this.queue];
  }

  public clear(): void {
    this.queue = [];
  }
}
export const deadLetterQueue = new DeadLetterQueue();

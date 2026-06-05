import { AIIdleEvent } from './eventTypes';

export class RetryManager {
  private maxRetries = 3;

  public shouldRetry(event: AIIdleEvent): boolean {
    return event.retryCount < this.maxRetries;
  }

  public getBackoffDelay(retryCount: number): number {
    return Math.pow(2, retryCount) * 100; // Exponential backoff ms
  }
}
export const retryManager = new RetryManager();

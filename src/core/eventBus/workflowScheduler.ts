import { AIIdleEvent } from './eventTypes';

export class WorkflowScheduler {
  private queue: AIIdleEvent[] = [];

  public schedule(event: AIIdleEvent): void {
    this.queue.push(event);
    // Sort descending by priority weight
    const weights: Record<string, number> = {
      'Critical': 5,
      'High': 4,
      'Normal': 3,
      'Low': 2,
      'Background': 1
    };
    this.queue.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
  }

  public next(): AIIdleEvent | undefined {
    return this.queue.shift();
  }
}
export const workflowScheduler = new WorkflowScheduler();

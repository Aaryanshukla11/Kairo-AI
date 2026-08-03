import { QueueType } from './workflowTypes';

export class WorkflowQueueManager {
  private queue: string[] = [];

  enqueue(item: string, queueType: QueueType = QueueType.FIFO): void {
    if (queueType === QueueType.Priority) {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }
  }

  dequeue(): string | undefined {
    return this.queue.shift();
  }

  getQueue(): string[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }
}

export const workflowQueueManager = new WorkflowQueueManager();

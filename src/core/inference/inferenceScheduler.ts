import { InferenceQueue, PipelineQueueItem } from './inferenceQueue';

export class InferenceScheduler {
  private active = false;

  public async runScheduler(queue: InferenceQueue, executor: (item: PipelineQueueItem) => Promise<void>): Promise<void> {
    if (this.active) return;
    this.active = true;

    try {
      let item = queue.dequeue();
      while (item) {
        try {
          await executor(item);
        } catch (err) {
          item.reject(err);
        }
        item = queue.dequeue();
      }
    } finally {
      this.active = false;
    }
  }

  public isBusy(): boolean {
    return this.active;
  }
}

export const inferenceScheduler = new InferenceScheduler();

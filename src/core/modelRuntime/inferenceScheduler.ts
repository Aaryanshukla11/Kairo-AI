import { InferenceQueue } from './inferenceQueue';
import { ModelProvider } from './providers/baseProvider';

export class InferenceScheduler {
  private processing = false;

  public async processQueue(queue: InferenceQueue, provider: ModelProvider): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      let item = queue.dequeue();
      while (item) {
        try {
          const res = await provider.generate(
            item.promptPkg,
            item.config,
            item.onToken,
            item.signal
          );
          item.resolve(res);
        } catch (err) {
          item.reject(err);
        }
        item = queue.dequeue();
      }
    } finally {
      this.processing = false;
    }
  }

  public isBusy(): boolean {
    return this.processing;
  }
}

export const inferenceScheduler = new InferenceScheduler();

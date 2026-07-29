import { PromptPackage } from '../../promptAssembly/promptTypes';
import { GenerationConfig, InferenceResult } from './runtimeTypes';

export interface QueueItem {
  promptPkg: PromptPackage;
  config: GenerationConfig;
  onToken?: (token: string) => void;
  resolve: (res: InferenceResult) => void;
  reject: (err: any) => void;
  signal?: AbortSignal;
}

export class InferenceQueue {
  private queue: QueueItem[] = [];

  public enqueue(item: QueueItem): void {
    this.queue.push(item);
  }

  public dequeue(): QueueItem | undefined {
    return this.queue.shift();
  }

  public getLength(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}

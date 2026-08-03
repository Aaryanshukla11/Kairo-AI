import { InferenceRequestModel, InferenceResponseModel } from './inferenceTypes';

export interface PipelineQueueItem {
  request: InferenceRequestModel;
  onToken?: (token: string) => void;
  resolve: (res: InferenceResponseModel) => void;
  reject: (err: any) => void;
  signal?: AbortSignal;
}

export class InferenceQueue {
  private queue: PipelineQueueItem[] = [];

  public enqueue(item: PipelineQueueItem): void {
    this.queue.push(item);
  }

  public dequeue(): PipelineQueueItem | undefined {
    return this.queue.shift();
  }

  public getLength(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}

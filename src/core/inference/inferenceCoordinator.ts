import { InferenceRequestModel, InferenceResponseModel, SessionState, InferenceEventType } from './inferenceTypes';
import { inferenceEngine } from './inferenceEngine';
import { inferenceSessionManager } from './inferenceSession';
import { InferenceQueue, PipelineQueueItem } from './inferenceQueue';
import { inferenceScheduler } from './inferenceScheduler';
import { cancellationManager } from './cancellationManager';

export class InferenceCoordinator {
  private queue = new InferenceQueue();

  public async runInference(
    request: InferenceRequestModel,
    isModelLoaded: boolean,
    onToken?: (token: string) => void
  ): Promise<InferenceResponseModel> {
    const session = inferenceSessionManager.createSession(request.sessionId, request.modelId);
    inferenceSessionManager.updateState(request.sessionId, SessionState.Queued);

    const signal = cancellationManager.register(request.sessionId);

    return new Promise<InferenceResponseModel>((resolve, reject) => {
      const item: PipelineQueueItem = {
        request,
        onToken,
        resolve: (res) => {
          cancellationManager.remove(request.sessionId);
          resolve(res);
        },
        reject: (err) => {
          cancellationManager.remove(request.sessionId);
          reject(err);
        },
        signal
      };

      this.queue.enqueue(item);

      inferenceScheduler.runScheduler(this.queue, async (activeItem) => {
        try {
          const res = await inferenceEngine.executeRequest(
            activeItem.request,
            isModelLoaded,
            activeItem.onToken,
            activeItem.signal
          );
          activeItem.resolve(res);
        } catch (err) {
          activeItem.reject(err);
        }
      });
    });
  }

  public getQueueLength(): number {
    return this.queue.getLength();
  }

  public cancelSession(sessionId: string): void {
    cancellationManager.cancel(sessionId);
  }
}

export const inferenceCoordinator = new InferenceCoordinator();

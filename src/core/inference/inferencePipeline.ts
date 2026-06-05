import { inferenceCoordinator } from './inferenceCoordinator';
import { inferenceSessionManager } from './inferenceSession';
import { inferenceEngine } from './inferenceEngine';
import { inferenceEvents } from './inferenceEvents';
import { InferenceRequestModel, InferenceResponseModel, InferenceExecutionReport } from './inferenceTypes';

export class InferencePipeline {
  public async run(
    request: InferenceRequestModel,
    isModelLoaded = true,
    onToken?: (token: string) => void
  ): Promise<InferenceResponseModel> {
    return inferenceCoordinator.runInference(request, isModelLoaded, onToken);
  }

  public cancel(sessionId: string): void {
    inferenceCoordinator.cancelSession(sessionId);
  }

  public getSession(sessionId: string) {
    return inferenceSessionManager.getSession(sessionId);
  }

  public generateExecutionReport(sessionId: string): InferenceExecutionReport {
    const session = inferenceSessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return {
      reportId: `REP-${Date.now()}`,
      sessionId,
      timestamp: Date.now(),
      request: {
        requestId: `req-${sessionId}`,
        sessionId,
        modelId: session.modelId,
        prompt: ''
      },
      state: session.state
    };
  }

  public subscribe(listener: any): () => void {
    return inferenceEvents.subscribe(listener);
  }
}

export const inferencePipeline = new InferencePipeline();

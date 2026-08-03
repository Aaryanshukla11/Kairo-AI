import { InferenceRequestModel, InferenceResponseModel, SessionState, InferenceEventType } from './inferenceTypes';
import { requestCompiler } from './requestCompiler';
import { inferenceSessionManager } from './inferenceSession';
import { inferenceValidator } from './inferenceValidator';
import { responseAssembler } from './responseAssembler';
import { cancellationManager } from './cancellationManager';
import { inferenceMetricsTracker } from './inferenceMetrics';
import { inferenceEvents } from './inferenceEvents';
import { MockExecutor } from './providers/mockExecutor';
import { LlamaCppExecutor } from './providers/llamaCppExecutor';
import { OnnxExecutor } from './providers/onnxExecutor';
import { MlxExecutor } from './providers/mlxExecutor';

export class InferenceEngine {
  private mockExec = new MockExecutor();
  private llamaExec = new LlamaCppExecutor();
  private onnxExec = new OnnxExecutor();
  private mlxExec = new MlxExecutor();

  public async executeRequest(
    request: InferenceRequestModel,
    isModelLoaded: boolean,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<InferenceResponseModel> {
    inferenceEvents.emit(InferenceEventType.RequestReceived, request.sessionId, { request });
    
    // Validate
    inferenceValidator.validateRequest(request, isModelLoaded);
    
    // Compile
    const compiled = requestCompiler.compile(request);
    inferenceEvents.emit(InferenceEventType.RequestCompiled, request.sessionId, { compiled });

    // State transition -> Running
    inferenceSessionManager.updateState(request.sessionId, SessionState.Running);
    inferenceEvents.emit(InferenceEventType.SessionTransition, request.sessionId, { state: SessionState.Running });

    const start = Date.now();
    let text = '';
    let finishReason: 'stop' | 'length' | 'cancelled' = 'stop';
    let timeToFirstTokenMs = 0;

    try {
      // Determine executor based on model ID
      const modelId = request.modelId.toLowerCase();
      if (modelId.includes('llama')) {
        const res = await this.llamaExec.execute(request, onToken, signal);
        text = res.text;
        finishReason = res.finishReason;
        timeToFirstTokenMs = res.timeToFirstTokenMs;
      } else if (modelId.includes('onnx')) {
        const res = await this.onnxExec.execute(request, onToken, signal);
        text = res.text;
        finishReason = res.finishReason;
        timeToFirstTokenMs = res.timeToFirstTokenMs;
      } else if (modelId.includes('mlx')) {
        const res = await this.mlxExec.execute(request, onToken, signal);
        text = res.text;
        finishReason = res.finishReason;
        timeToFirstTokenMs = res.timeToFirstTokenMs;
      } else {
        const res = await this.mockExec.execute(request, onToken, signal);
        text = res.text;
        finishReason = res.finishReason;
        timeToFirstTokenMs = res.timeToFirstTokenMs;
      }

      if (signal?.aborted) {
        finishReason = 'cancelled';
      }

      const latencyMs = Date.now() - start;
      const metrics = inferenceMetricsTracker.calculate(request.prompt, text, latencyMs, timeToFirstTokenMs);
      const response = responseAssembler.assemble(request.sessionId, text, finishReason, metrics);

      const finalState = finishReason === 'cancelled' ? SessionState.Cancelled : SessionState.Completed;
      inferenceSessionManager.updateState(request.sessionId, finalState);
      inferenceEvents.emit(InferenceEventType.SessionTransition, request.sessionId, { state: finalState });

      inferenceEvents.emit(InferenceEventType.InferenceCompleted, request.sessionId, { response });
      inferenceEvents.emit(InferenceEventType.MetricsPublished, request.sessionId, { metrics });

      return response;
    } catch (err: any) {
      inferenceSessionManager.updateState(request.sessionId, SessionState.Failed, err.message);
      inferenceEvents.emit(InferenceEventType.SessionTransition, request.sessionId, { state: SessionState.Failed, error: err.message });
      inferenceEvents.emit(InferenceEventType.InferenceError, request.sessionId, { error: err.message });
      throw err;
    }
  }
}

export const inferenceEngine = new InferenceEngine();

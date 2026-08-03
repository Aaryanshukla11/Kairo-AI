import { InferenceResponseModel, PipelineMetrics } from './inferenceTypes';

export class InferenceResponse {
  public static create(
    sessionId: string,
    text: string,
    finishReason: 'stop' | 'length' | 'cancelled',
    metrics: PipelineMetrics
  ): InferenceResponseModel {
    return {
      responseId: `res-${Date.now()}`,
      sessionId,
      text,
      finishReason,
      metrics
    };
  }
}

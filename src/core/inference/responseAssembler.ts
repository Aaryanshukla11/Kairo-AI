import { InferenceResponse } from './inferenceResponse';
import { InferenceResponseModel, PipelineMetrics } from './inferenceTypes';

export class ResponseAssembler {
  public assemble(
    sessionId: string,
    text: string,
    finishReason: 'stop' | 'length' | 'cancelled',
    metrics: PipelineMetrics
  ): InferenceResponseModel {
    return InferenceResponse.create(sessionId, text, finishReason, metrics);
  }
}

export const responseAssembler = new ResponseAssembler();

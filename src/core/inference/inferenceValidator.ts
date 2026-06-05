import { InferenceRequestModel } from './inferenceTypes';

export class InferenceValidator {
  public validateRequest(request: InferenceRequestModel, isModelLoaded: boolean): void {
    if (!request.requestId) {
      throw new Error('Inference validation error: Request ID is required.');
    }
    if (!request.sessionId) {
      throw new Error('Inference validation error: Session ID is required.');
    }
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error('Inference validation error: Prompt is required and cannot be empty.');
    }
    if (!isModelLoaded) {
      throw new Error('Inference validation error: Requested model is not loaded in model runtime.');
    }

    // Config bounds checks
    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2.0)) {
      throw new Error('Inference validation error: Temperature must be between 0.0 and 2.0.');
    }
    if (request.topP !== undefined && (request.topP < 0 || request.topP > 1.0)) {
      throw new Error('Inference validation error: TopP must be between 0.0 and 1.0.');
    }
  }
}

export const inferenceValidator = new InferenceValidator();

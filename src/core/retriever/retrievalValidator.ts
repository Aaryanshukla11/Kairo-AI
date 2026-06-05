import { RetrievalRequest } from './retrieverTypes';

export class RetrievalValidator {
  /**
   * Asserts request parameters, checking prompt content and filters structure.
   */
  public validateRequest(request: RetrievalRequest): void {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error('Retrieval validation error: Request prompt is required and cannot be empty');
    }

    if (request.filters !== undefined && typeof request.filters !== 'object') {
      throw new Error('Retrieval validation error: Invalid metadata query filters object structure');
    }
  }
}

export const retrievalValidator = new RetrievalValidator();

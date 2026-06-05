import { InferenceRequestModel } from './inferenceTypes';

export class RequestCompiler {
  public compile(request: InferenceRequestModel): string {
    let compiled = '';
    if (request.systemPrompt) {
      compiled += `System: ${request.systemPrompt}\n\n`;
    }
    if (request.workspaceContext) {
      compiled += `Context:\n${request.workspaceContext}\n\n`;
    }
    compiled += `User: ${request.prompt}`;
    return compiled;
  }
}

export const requestCompiler = new RequestCompiler();

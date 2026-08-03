import { InferenceRequestModel } from '../inferenceTypes';

export class LlamaCppExecutor {
  public async execute(
    request: InferenceRequestModel,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<{ text: string; finishReason: 'stop' | 'length' | 'cancelled'; timeToFirstTokenMs: number }> {
    const start = Date.now();
    const responseText = `[llama.cpp pipeline output] for prompt: ${request.prompt.substring(0, 30)}...`;
    
    if (onToken) {
      onToken(responseText);
    }

    return {
      text: responseText,
      finishReason: 'stop',
      timeToFirstTokenMs: Date.now() - start
    };
  }
}

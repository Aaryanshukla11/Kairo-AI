import { InferenceRequestModel, PipelineMetrics } from '../inferenceTypes';

export class MockExecutor {
  public async execute(
    request: InferenceRequestModel,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<{ text: string; finishReason: 'stop' | 'length' | 'cancelled'; timeToFirstTokenMs: number }> {
    const start = Date.now();
    const responseText = `[Pipeline Mock Response] Responding to: "${request.prompt}". This execution is routed completely locally offline.`;
    const words = responseText.split(' ');
    let outputText = '';
    let timeToFirstTokenMs = 0;

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        return {
          text: outputText,
          finishReason: 'cancelled',
          timeToFirstTokenMs
        };
      }

      const word = words[i] + ' ';
      outputText += word;

      if (i === 0) {
        timeToFirstTokenMs = Date.now() - start;
      }

      if (onToken) {
        onToken(word);
      }

      await new Promise(r => setTimeout(r, 10));
    }

    return {
      text: outputText,
      finishReason: 'stop',
      timeToFirstTokenMs
    };
  }
}

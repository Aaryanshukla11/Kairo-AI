import { PipelineMetrics } from './inferenceTypes';

export class InferenceMetricsTracker {
  public calculate(
    promptText: string,
    completionText: string,
    latencyMs: number,
    timeToFirstTokenMs?: number
  ): PipelineMetrics {
    const promptTokens = Math.ceil(promptText.length / 4);
    const completionTokens = Math.ceil(completionText.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const tokensPerSec = latencyMs > 0 ? (completionTokens / (latencyMs / 1000)) : 0;

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      tokensPerSec: parseFloat(tokensPerSec.toFixed(2)),
      timeToFirstTokenMs
    };
  }
}

export const inferenceMetricsTracker = new InferenceMetricsTracker();

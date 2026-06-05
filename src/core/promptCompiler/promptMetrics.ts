import { PromptMetrics } from './promptTypes';

export class PromptMetricsCalculator {
  public calculate(
    systemText: string,
    userText: string,
    contextText: string,
    durationMs: number
  ): PromptMetrics {
    const systemTokens = Math.ceil(systemText.length / 4);
    const userTokens = Math.ceil(userText.length / 4);
    const contextTokens = Math.ceil(contextText.length / 4);

    return {
      generationTimeMs: durationMs,
      totalTokens: systemTokens + userTokens + contextTokens,
      systemTokens,
      userTokens,
      contextTokens
    };
  }
}

export const promptMetricsCalculator = new PromptMetricsCalculator();

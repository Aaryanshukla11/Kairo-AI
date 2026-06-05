import { InferenceMetrics } from './runtimeTypes';

export class InferenceMetricsTracker {
  private runs: InferenceMetrics[] = [];

  public trackRun(promptTokens: number, completionTokens: number, latencyMs: number, timeToFirstTokenMs?: number): InferenceMetrics {
    const totalTokens = promptTokens + completionTokens;
    const tokensPerSec = latencyMs > 0 ? (completionTokens / (latencyMs / 1000)) : 0;
    
    const runMetrics: InferenceMetrics = {
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      tokensPerSec: parseFloat(tokensPerSec.toFixed(2)),
      timeToFirstTokenMs
    };

    this.runs.push(runMetrics);
    return runMetrics;
  }

  public getAverageMetrics(): Partial<InferenceMetrics> {
    if (this.runs.length === 0) return {};
    let promptSum = 0;
    let compSum = 0;
    let latSum = 0;
    let tpsSum = 0;

    for (const run of this.runs) {
      promptSum += run.promptTokens;
      compSum += run.completionTokens;
      latSum += run.latencyMs;
      tpsSum += run.tokensPerSec;
    }

    return {
      promptTokens: promptSum / this.runs.length,
      completionTokens: compSum / this.runs.length,
      totalTokens: (promptSum + compSum) / this.runs.length,
      latencyMs: latSum / this.runs.length,
      tokensPerSec: parseFloat((tpsSum / this.runs.length).toFixed(2))
    };
  }

  public clear(): void {
    this.runs = [];
  }
}

export const inferenceMetricsTracker = new InferenceMetricsTracker();

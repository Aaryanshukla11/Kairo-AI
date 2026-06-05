import { ValidationMetricModel } from './validationTypes';

export class MetricAggregator {
  public aggregate(results: ValidationMetricModel[]): ValidationMetricModel {
    if (results.length === 0) {
      return {
        validationLoss: 0,
        accuracy: 0,
        perplexity: 0,
        passRate: 0,
        inferenceTimeMs: 0,
        tokensPerSec: 0,
        memoryUsageMB: 0,
        benchmarkScore: 0
      };
    }

    let totalLoss = 0;
    let totalAccuracy = 0;
    let totalPerplexity = 0;
    let totalPassRate = 0;
    let totalInferenceTime = 0;
    let totalTokensPerSec = 0;
    let maxMemoryUsage = 0;
    let totalBenchmarkScore = 0;

    for (const res of results) {
      totalLoss += res.validationLoss;
      totalAccuracy += res.accuracy;
      totalPerplexity += res.perplexity;
      totalPassRate += res.passRate;
      totalInferenceTime += res.inferenceTimeMs;
      totalTokensPerSec += res.tokensPerSec;
      maxMemoryUsage = Math.max(maxMemoryUsage, res.memoryUsageMB);
      totalBenchmarkScore += res.benchmarkScore;
    }

    const count = results.length;

    return {
      validationLoss: parseFloat((totalLoss / count).toFixed(4)),
      accuracy: parseFloat((totalAccuracy / count).toFixed(4)),
      perplexity: parseFloat((totalPerplexity / count).toFixed(4)),
      passRate: parseFloat((totalPassRate / count).toFixed(4)),
      inferenceTimeMs: parseFloat((totalInferenceTime / count).toFixed(2)),
      tokensPerSec: parseFloat((totalTokensPerSec / count).toFixed(2)),
      memoryUsageMB: parseFloat(maxMemoryUsage.toFixed(2)),
      benchmarkScore: parseFloat((totalBenchmarkScore / count).toFixed(2))
    };
  }
}

export const metricAggregator = new MetricAggregator();
export default metricAggregator;

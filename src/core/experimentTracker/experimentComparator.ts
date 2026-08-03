import { ExperimentModel } from './experimentTypes';

export interface ExperimentComparisonReport {
  e1: string;
  e2: string;
  accuracyDiff?: number;
  lossDiff?: number;
  perplexityDiff?: number;
  tokensPerSecDiff?: number;
  gpuUsageDiff?: number;
}

export class ExperimentComparator {
  public compare(e1: ExperimentModel, e2: ExperimentModel): ExperimentComparisonReport {
    const accuracyDiff = (e2.metrics.accuracy !== undefined && e1.metrics.accuracy !== undefined)
      ? parseFloat((e2.metrics.accuracy - e1.metrics.accuracy).toFixed(4))
      : undefined;

    const lossDiff = (e2.metrics.trainingLoss !== undefined && e1.metrics.trainingLoss !== undefined)
      ? parseFloat((e2.metrics.trainingLoss - e1.metrics.trainingLoss).toFixed(4))
      : undefined;

    const perplexityDiff = (e2.metrics.perplexity !== undefined && e1.metrics.perplexity !== undefined)
      ? parseFloat((e2.metrics.perplexity - e1.metrics.perplexity).toFixed(4))
      : undefined;

    const tokensPerSecDiff = (e2.metrics.throughputTokensPerSec !== undefined && e1.metrics.throughputTokensPerSec !== undefined)
      ? e2.metrics.throughputTokensPerSec - e1.metrics.throughputTokensPerSec
      : undefined;

    const gpuUsageDiff = (e2.metrics.gpuUsagePercent !== undefined && e1.metrics.gpuUsagePercent !== undefined)
      ? parseFloat((e2.metrics.gpuUsagePercent - e1.metrics.gpuUsagePercent).toFixed(2))
      : undefined;

    return {
      e1: e1.experimentId,
      e2: e2.experimentId,
      accuracyDiff,
      lossDiff,
      perplexityDiff,
      tokensPerSecDiff,
      gpuUsageDiff
    };
  }
}

export const experimentComparator = new ExperimentComparator();
export default experimentComparator;

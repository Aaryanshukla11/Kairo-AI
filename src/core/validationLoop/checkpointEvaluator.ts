import { ValidationMetricModel, CheckpointComparison } from './validationTypes';

export class CheckpointEvaluator {
  public compare(
    currentMetrics: ValidationMetricModel,
    baselineMetrics: ValidationMetricModel,
    currentCheckpointId: string,
    baselineCheckpointId: string
  ): CheckpointComparison {
    const lossDelta = parseFloat((currentMetrics.validationLoss - baselineMetrics.validationLoss).toFixed(4));
    const accuracyDelta = parseFloat((currentMetrics.accuracy - baselineMetrics.accuracy).toFixed(4));
    const perplexityDelta = parseFloat((currentMetrics.perplexity - baselineMetrics.perplexity).toFixed(4));
    const benchmarkScoreDelta = parseFloat((currentMetrics.benchmarkScore - baselineMetrics.benchmarkScore).toFixed(2));

    // A model is "better" if validation loss is lower and accuracy/benchmark score is higher
    // If the validation loss decreased, or if the validation loss is identical but accuracy improved
    const isBetter = lossDelta < -0.001 || (Math.abs(lossDelta) <= 0.001 && accuracyDelta > 0.001);

    let notes = '';
    if (isBetter) {
      notes = `New checkpoint ${currentCheckpointId} outperforms baseline ${baselineCheckpointId}. Loss decreased by ${Math.abs(lossDelta)}, accuracy improved by ${accuracyDelta}.`;
    } else {
      notes = `New checkpoint ${currentCheckpointId} does not outperform baseline ${baselineCheckpointId}. Loss delta: ${lossDelta}, accuracy delta: ${accuracyDelta}.`;
    }

    return {
      currentCheckpointId,
      baselineCheckpointId,
      lossDelta,
      accuracyDelta,
      perplexityDelta,
      benchmarkScoreDelta,
      isBetter,
      notes
    };
  }
}

export const checkpointEvaluator = new CheckpointEvaluator();
export default checkpointEvaluator;

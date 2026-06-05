import { ValidationMetricModel } from '../../validationLoop/validationTypes';
import { StoppingPolicyConfig } from '../stoppingTypes';

export class ValidationMetricProvider {
  public evaluate(
    metric: ValidationMetricModel,
    config: StoppingPolicyConfig,
    bestValue: number
  ): { hasImproved: boolean; currentVal: number; delta: number } {
    let currentVal = 0;
    const metricName = config.metric;

    if (metricName === 'validationLoss') {
      currentVal = metric.validationLoss;
    } else if (metricName === 'accuracy') {
      currentVal = metric.accuracy;
    } else if (metricName === 'perplexity') {
      currentVal = metric.perplexity;
    } else if (metricName === 'compositeScore') {
      currentVal = metric.benchmarkScore;
    } else {
      currentVal = metric.validationLoss;
    }

    const minImprovement = config.minImprovement || 0.0001;

    if (config.mode === 'min') {
      const delta = bestValue - currentVal;
      const hasImproved = delta > minImprovement;
      return { hasImproved, currentVal, delta };
    } else {
      const delta = currentVal - bestValue;
      const hasImproved = delta > minImprovement;
      return { hasImproved, currentVal, delta };
    }
  }
}

export const validationMetricProvider = new ValidationMetricProvider();
export default validationMetricProvider;

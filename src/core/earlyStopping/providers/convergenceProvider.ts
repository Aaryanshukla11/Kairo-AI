import { StoppingPolicyConfig } from '../stoppingTypes';
import { TrainingMetricsModel } from '../../trainingEngine/trainingTypes';

export class ConvergenceProvider {
  public evaluate(
    trainHistory: TrainingMetricsModel[],
    config: StoppingPolicyConfig,
    bestValue: number
  ): { hasImproved: boolean; currentVal: number; delta: number } {
    if (trainHistory.length === 0) {
      return { hasImproved: false, currentVal: 0, delta: 0 };
    }

    const currentVal = trainHistory[trainHistory.length - 1].trainingLoss;
    const minImprovement = config.minImprovement || 0.0001;

    // For training loss convergence, mode is min
    const delta = bestValue - currentVal;
    const hasImproved = delta > minImprovement;

    return { hasImproved, currentVal, delta };
  }
}

export const convergenceProvider = new ConvergenceProvider();
export default convergenceProvider;

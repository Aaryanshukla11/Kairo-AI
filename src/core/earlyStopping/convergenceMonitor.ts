import { TrainingMetricsModel } from '../trainingEngine/trainingTypes';

export class ConvergenceMonitor {
  public analyzeConvergence(
    trainHistory: TrainingMetricsModel[]
  ): {
    isConverging: boolean;
    rateOfChange: number;
    hasStagnated: boolean;
    reason: string;
  } {
    if (trainHistory.length < 3) {
      return {
        isConverging: true,
        rateOfChange: 0,
        hasStagnated: false,
        reason: 'Insufficient history data.'
      };
    }

    const recent = trainHistory.slice(-5);
    const firstLoss = recent[0].trainingLoss;
    const lastLoss = recent[recent.length - 1].trainingLoss;

    const totalDelta = firstLoss - lastLoss;
    const rateOfChange = parseFloat((totalDelta / (recent.length - 1)).toFixed(5));

    // Stagnated if rate of change is positive or less than 0.0001 over multiple steps
    const hasStagnated = rateOfChange <= 0.0001;

    // Converging if overall loss decreased
    const isConverging = totalDelta > 0;

    let reason = '';
    if (hasStagnated) {
      reason = `Training loss convergence has stagnated (mean step delta ${rateOfChange}).`;
    } else if (isConverging) {
      reason = `Training is converging steadily (mean step delta ${rateOfChange}).`;
    } else {
      reason = `Training loss is increasing/diverging (mean step delta ${rateOfChange}).`;
    }

    return {
      isConverging,
      rateOfChange,
      hasStagnated,
      reason
    };
  }
}

export const convergenceMonitor = new ConvergenceMonitor();
export default convergenceMonitor;

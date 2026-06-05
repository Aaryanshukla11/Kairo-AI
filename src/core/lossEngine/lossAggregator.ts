import { LossStrategy, LossReportModel } from './lossTypes';

export class LossAggregator {
  public aggregate(
    sessionId: string,
    strategy: LossStrategy,
    currentLoss: number,
    history: number[]
  ): LossReportModel {
    const reportId = `LOSS-REP-${sessionId}-${Date.now()}`;
    const allLosses = [...history, currentLoss];
    const len = allLosses.length;

    const minLoss = Math.min(...allLosses);
    const maxLoss = Math.max(...allLosses);
    const sum = allLosses.reduce((acc, v) => acc + v, 0);
    const averageLoss = parseFloat((sum / len).toFixed(4));

    // Calculate variance
    const varianceSum = allLosses.reduce((acc, v) => acc + Math.pow(v - averageLoss, 2), 0);
    const lossVariance = parseFloat((varianceSum / len).toFixed(6));

    // Calculate moving average of last 5 items
    const last5 = allLosses.slice(-5);
    const movingAverage = parseFloat((last5.reduce((acc, v) => acc + v, 0) / last5.length).toFixed(4));

    // Calculate trend
    let lossTrend: 'decreasing' | 'increasing' | 'stable' = 'stable';
    if (len >= 3) {
      const diff1 = allLosses[len - 1] - allLosses[len - 2];
      const diff2 = allLosses[len - 2] - allLosses[len - 3];
      const avgDiff = (diff1 + diff2) / 2;

      if (avgDiff < -0.01) {
        lossTrend = 'decreasing';
      } else if (avgDiff > 0.01) {
        lossTrend = 'increasing';
      }
    }

    return {
      reportId,
      sessionId,
      strategy,
      currentLoss,
      averageLoss,
      minLoss,
      maxLoss,
      lossVariance,
      movingAverage,
      lossTrend,
      createdAt: Date.now()
    };
  }
}

export const lossAggregator = new LossAggregator();
export default lossAggregator;

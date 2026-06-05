import { BenchmarkReport } from './evaluationTypes';

export class ScoreAggregator {
  public aggregate(reports: BenchmarkReport[]): number {
    if (reports.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    reports.forEach(report => {
      // Accuracy/passRate represents the core score component
      const score = report.metrics.accuracy * 100;
      
      // Default uniform weight fallback unless specified in metadata
      const weight = 1.0;

      weightedSum += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
  }
}

export const scoreAggregator = new ScoreAggregator();
export default scoreAggregator;

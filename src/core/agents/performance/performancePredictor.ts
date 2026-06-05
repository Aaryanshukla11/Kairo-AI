import { PerformanceLevel } from './performanceTypes';

export class PerformancePredictor {
  public predictFutureTrend(score: number): { trend: string; level: PerformanceLevel } {
    let level = PerformanceLevel.Excellent;
    let trend = 'Stable development velocity with minimal resource additions.';

    if (score < 40) {
      level = PerformanceLevel.Critical;
      trend = 'Severe performance degradation risks. High memory footprint forecast.';
    } else if (score < 60) {
      level = PerformanceLevel.NeedsImprovement;
      trend = 'Downward trend due to algorithm scaling complexities.';
    } else if (score < 80) {
      level = PerformanceLevel.Acceptable;
      trend = 'Minor load increments. Score fluctuates inside stable margins.';
    } else if (score < 90) {
      level = PerformanceLevel.Good;
      trend = 'Optimal execution bounds. Suitable headroom for extra tasks.';
    }

    return { trend, level };
  }
}

export const performancePredictor = new PerformancePredictor();

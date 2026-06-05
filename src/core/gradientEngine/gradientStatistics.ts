import { GradientReportModel } from './gradientTypes';

export interface GradientStatsComparison {
  r1: string;
  r2: string;
  globalNormDiff: number;
  globalMeanDiff: number;
  globalVarianceDiff: number;
}

export class GradientStatistics {
  public compare(
    report1: GradientReportModel,
    report2: GradientReportModel
  ): GradientStatsComparison {
    return {
      r1: report1.reportId,
      r2: report2.reportId,
      globalNormDiff: parseFloat((report2.globalNorm - report1.globalNorm).toFixed(4)),
      globalMeanDiff: parseFloat((report2.globalMean - report1.globalMean).toFixed(4)),
      globalVarianceDiff: parseFloat((report2.globalVariance - report1.globalVariance).toFixed(4))
    };
  }
}

export const gradientStatistics = new GradientStatistics();
export default gradientStatistics;

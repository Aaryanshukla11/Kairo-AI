import { LossReportModel } from './lossTypes';

export interface LossStatsComparison {
  r1: string;
  r2: string;
  lossDiff: number;
  averageLossDiff: number;
}

export class LossStatistics {
  public compare(
    report1: LossReportModel,
    report2: LossReportModel
  ): LossStatsComparison {
    return {
      r1: report1.reportId,
      r2: report2.reportId,
      lossDiff: parseFloat((report2.currentLoss - report1.currentLoss).toFixed(4)),
      averageLossDiff: parseFloat((report2.averageLoss - report1.averageLoss).toFixed(4))
    };
  }
}

export const lossStatistics = new LossStatistics();
export default lossStatistics;

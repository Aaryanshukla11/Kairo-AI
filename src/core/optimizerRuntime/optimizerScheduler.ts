import { LrScheduleType, LrReportModel } from './optimizerTypes';
import { learningRateManager } from './learningRateManager';

export class OptimizerScheduler {
  public updateLr(
    schedule: LrScheduleType,
    baseLr: number,
    step: number,
    totalSteps: number,
    warmupSteps: number = 0
  ): LrReportModel {
    const currentLr = learningRateManager.calculateLr(schedule, baseLr, step, totalSteps, warmupSteps);

    return {
      scheduleType: schedule,
      currentLr,
      step,
      totalSteps
    };
  }
}

export const optimizerScheduler = new OptimizerScheduler();
export default optimizerScheduler;

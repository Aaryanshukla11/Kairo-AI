import { FineTuningSessionModel } from './fineTuningTypes';

export class FineTuningScheduler {
  public shouldRunValidation(session: FineTuningSessionModel, evalFrequency: number): boolean {
    if (session.currentStep === 0) {
      return false;
    }
    return session.currentStep % evalFrequency === 0;
  }

  public shouldSaveCheckpoint(session: FineTuningSessionModel, checkpointFrequency: number): boolean {
    if (session.currentStep === 0) {
      return false;
    }
    return session.currentStep % checkpointFrequency === 0;
  }

  public isCompleted(session: FineTuningSessionModel): boolean {
    return session.currentStep >= session.totalSteps;
  }
}

export const fineTuningScheduler = new FineTuningScheduler();
export default fineTuningScheduler;

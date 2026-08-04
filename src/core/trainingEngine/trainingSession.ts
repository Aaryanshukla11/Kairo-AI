import { TrainingSessionModel, TrainingState } from './trainingTypes';

export class TrainingSession {
  private activeSession?: TrainingSessionModel;

  public initialize(
    datasetVersion: string,
    tokenizerVersion: string,
    configurationVersion: string,
    totalEpochs: number,
    totalSteps: number
  ): TrainingSessionModel {
    const sessionId = `SESS-TRAIN-${Date.now()}`;
    
    this.activeSession = {
      sessionId,
      state: 'Created',
      datasetVersion,
      tokenizerVersion,
      configurationVersion,
      currentEpoch: 0,
      currentStep: 0,
      totalEpochs,
      totalSteps,
      startTime: Date.now(),
      metrics: []
    };

    return this.activeSession;
  }

  public getSession(): TrainingSessionModel | undefined {
    return this.activeSession;
  }

  public updateState(state: TrainingState): void {
    if (this.activeSession) {
      this.activeSession.state = state;
      if (state === 'Completed' || state === 'Failed' || state === 'Cancelled') {
        this.activeSession.endTime = Date.now();
      }
    }
  }

  public recordProgress(epoch: number, step: number, metrics: any): void {
    if (this.activeSession) {
      this.activeSession.currentEpoch = epoch;
      this.activeSession.currentStep = step;
      this.activeSession.metrics.push(metrics);
    }
  }

  public assignArtifacts(checkpointId: string, experimentId: string): void {
    if (this.activeSession) {
      this.activeSession.checkpointId = checkpointId;
      this.activeSession.experimentId = experimentId;
    }
  }

  public clear(): void {
    this.activeSession = undefined;
  }
}

export const trainingSession = new TrainingSession();
export default trainingSession;

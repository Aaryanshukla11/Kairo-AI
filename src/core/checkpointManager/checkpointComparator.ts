import { CheckpointModel } from './checkpointTypes';

export interface CheckpointComparison {
  c1: string;
  c2: string;
  stepDifference: number;
  epochDifference: number;
  valLossDifference: number;
  trainLossDifference: number;
  lrChanged: boolean;
}

export class CheckpointComparator {
  public compare(checkpoint1: CheckpointModel, checkpoint2: CheckpointModel): CheckpointComparison {
    return {
      c1: checkpoint1.checkpointId,
      c2: checkpoint2.checkpointId,
      stepDifference: checkpoint2.trainingStep - checkpoint1.trainingStep,
      epochDifference: checkpoint2.epoch - checkpoint1.epoch,
      valLossDifference: parseFloat((checkpoint2.evaluationResults.validationLoss - checkpoint1.evaluationResults.validationLoss).toFixed(4)),
      trainLossDifference: parseFloat((checkpoint2.evaluationResults.trainingLoss - checkpoint1.evaluationResults.trainingLoss).toFixed(4)),
      lrChanged: checkpoint1.optimizerState.lr !== checkpoint2.optimizerState.lr
    };
  }
}

export const checkpointComparator = new CheckpointComparator();
export default checkpointComparator;

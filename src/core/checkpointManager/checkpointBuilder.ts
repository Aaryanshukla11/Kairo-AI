import { CheckpointModel } from './checkpointTypes';
import * as crypto from 'crypto';

export class CheckpointBuilder {
  public buildCheckpoint(
    version: string,
    parentCheckpointId: string | undefined,
    trainingStep: number,
    epoch: number,
    globalStep: number,
    optimizerState: any,
    schedulerState: any,
    randomSeeds: Record<string, number>,
    tokenizerVersion: string,
    datasetVersion: string,
    configurationVersion: string,
    evaluationResults: { validationLoss: number; trainingLoss: number; accuracy?: number }
  ): CheckpointModel {
    const checkpointId = `CHK-STEP-${trainingStep}-${Date.now()}`;
    
    // Serialized states key strings to build checksum
    const serializedStates = JSON.stringify({
      trainingStep,
      epoch,
      globalStep,
      optimizerState,
      schedulerState,
      randomSeeds,
      evaluationResults
    });
    
    const checksum = 'sha256-' + crypto.createHash('sha256').update(serializedStates, 'utf8').digest('hex');

    return {
      checkpointId,
      version,
      parentCheckpointId,
      trainingStep,
      epoch,
      globalStep,
      optimizerState,
      schedulerState,
      randomSeeds,
      tokenizerVersion,
      datasetVersion,
      configurationVersion,
      evaluationResults,
      creationTimestamp: Date.now(),
      checksum
    };
  }
}

export const checkpointBuilder = new CheckpointBuilder();
export default checkpointBuilder;

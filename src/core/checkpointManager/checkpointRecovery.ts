import { CheckpointModel, RecoveryReportModel } from './checkpointTypes';
import { checkpointValidator } from './checkpointValidator';

export class CheckpointRecovery {
  public generateRecoveryReport(
    checkpoint: CheckpointModel
  ): RecoveryReportModel {
    const issues: string[] = [];
    const restorationSteps: string[] = [];

    const validation = checkpointValidator.validateCheckpoint(checkpoint);
    if (!validation.isValid) {
      issues.push(...validation.errors);
      restorationSteps.push('Checkpoint validation failed. Check integrity and checksum mismatch.');
    }

    if (issues.length === 0) {
      restorationSteps.push('1. Read config metadata.');
      restorationSteps.push(`2. Set training epoch to ${checkpoint.epoch} step ${checkpoint.trainingStep}.`);
      restorationSteps.push(`3. Restore optimizerState lr=${checkpoint.optimizerState.lr}.`);
      restorationSteps.push(`4. Set seeds parameters.`);
    }

    return {
      isRecoverable: issues.length === 0,
      checkpointId: checkpoint.checkpointId,
      issues,
      restorationSteps
    };
  }
}

export const checkpointRecovery = new CheckpointRecovery();
export default checkpointRecovery;

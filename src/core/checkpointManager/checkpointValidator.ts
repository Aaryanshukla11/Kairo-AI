import { CheckpointModel, CheckpointManifestModel } from './checkpointTypes';
import * as crypto from 'crypto';

export class CheckpointValidator {
  public validateCheckpoint(
    checkpoint: CheckpointModel,
    manifest?: CheckpointManifestModel
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Checkpoint integrity
    if (!checkpoint.checkpointId) {
      errors.push('Validation Error: Checkpoint ID is missing.');
    }
    if (checkpoint.trainingStep < 0) {
      errors.push('Validation Error: Training step cannot be negative.');
    }

    // 2. Checksum validation
    const serializedStates = JSON.stringify({
      trainingStep: checkpoint.trainingStep,
      epoch: checkpoint.epoch,
      globalStep: checkpoint.globalStep,
      optimizerState: checkpoint.optimizerState,
      schedulerState: checkpoint.schedulerState,
      randomSeeds: checkpoint.randomSeeds,
      evaluationResults: checkpoint.evaluationResults
    });
    const calculatedHash = 'sha256-' + crypto.createHash('sha256').update(serializedStates, 'utf8').digest('hex');
    
    if (checkpoint.checksum !== calculatedHash) {
      errors.push('Validation Error: Cryptographic checksum mismatch. Checkpoint has been corrupted.');
    }

    // 3. Manifest validation
    if (manifest) {
      if (manifest.checkpointId !== checkpoint.checkpointId) {
        errors.push('Validation Error: Manifest checkpoint ID mismatch.');
      }
      if (manifest.checksum !== checkpoint.checksum) {
        errors.push('Validation Error: Manifest checksum does not match checkpoint checksum.');
      }
    }

    // 4. Restorable state validation
    if (!checkpoint.optimizerState || !checkpoint.schedulerState) {
      errors.push('Validation Error: Optimizer or scheduler states are missing. Cannot restore training state.');
    }

    // 5. Optimizer compatibility checks
    const allowedOptimizers = ['AdamW', 'SGD', 'Adafactor'];
    if (!allowedOptimizers.includes(checkpoint.optimizerState.type)) {
      errors.push(`Validation Error: Optimizer [${checkpoint.optimizerState.type}] is incompatible with restoration configuration.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const checkpointValidator = new CheckpointValidator();
export default checkpointValidator;

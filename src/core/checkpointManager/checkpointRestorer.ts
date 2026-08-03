import { CheckpointModel } from './checkpointTypes';
import { checkpointStorage } from './checkpointStorage';
import { checkpointValidator } from './checkpointValidator';

export class CheckpointRestorer {
  public restore(checkpointId: string): CheckpointModel {
    const checkpoint = checkpointStorage.loadCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Restoration Error: Checkpoint ${checkpointId} not found in storage.`);
    }

    const validation = checkpointValidator.validateCheckpoint(checkpoint);
    if (!validation.isValid) {
      throw new Error(`Restoration Error: Checkpoint is corrupted: ${validation.errors.join(', ')}`);
    }

    return checkpoint;
  }
}

export const checkpointRestorer = new CheckpointRestorer();
export default checkpointRestorer;

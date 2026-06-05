import * as fs from 'fs';
import * as path from 'path';
import { CheckpointInfo } from './checkpointTypes';

export class CheckpointValidator {
  /**
   * Verifies workspace paths and metadata tags.
   */
  public validate(checkpoint: CheckpointInfo, workspaceRoot: string): void {
    if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
      throw new Error(`Checkpoint validation error: Workspace path does not exist: "${workspaceRoot}"`);
    }

    if (!checkpoint.workspaceId || !checkpoint.transactionId) {
      throw new Error('Checkpoint validation error: Missing workspaceId or transactionId metadata');
    }
  }

  /**
   * Assures snapshot directories are present on disk.
   */
  public validateSnapshotIntact(checkpointId: string, workspaceRoot: string): void {
    const wsCpDir = path.resolve(workspaceRoot, '.aiidle', 'checkpoints', checkpointId);
    const tmpCpDir = path.resolve(require('os').tmpdir(), 'kairo-checkpoints', path.basename(workspaceRoot), checkpointId);
    if (!fs.existsSync(wsCpDir) && !fs.existsSync(tmpCpDir)) {
      throw new Error(`Checkpoint validation error: Snapshot directory is missing at "${wsCpDir}"`);
    }
  }
}

export const checkpointValidator = new CheckpointValidator();

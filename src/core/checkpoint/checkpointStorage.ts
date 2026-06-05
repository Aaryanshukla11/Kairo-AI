import * as fs from 'fs';
import * as path from 'path';

export class CheckpointStorage {
  private storageDir: string;

  constructor(workspaceRoot: string) {
    const hasWorkspaceAiidle = fs.existsSync(path.resolve(workspaceRoot, '.aiidle'));
    this.storageDir = hasWorkspaceAiidle
      ? path.resolve(workspaceRoot, '.aiidle', 'checkpoints')
      : path.resolve(require('os').tmpdir(), 'kairo-checkpoints', path.basename(workspaceRoot));

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Saves copies of the affected files' original content to checkpoint storage.
   */
  public saveSnapshot(checkpointId: string, affectedFiles: string[], workspaceRoot: string): void {
    const cpDir = path.join(this.storageDir, checkpointId);
    if (!fs.existsSync(cpDir)) {
      fs.mkdirSync(cpDir, { recursive: true });
    }

    for (const file of affectedFiles) {
      const sourcePath = path.isAbsolute(file) ? file : path.resolve(workspaceRoot, file);
      const relative = path.relative(workspaceRoot, sourcePath);
      const destPath = path.join(cpDir, relative);

      if (fs.existsSync(sourcePath)) {
        const destParent = path.dirname(destPath);
        if (!fs.existsSync(destParent)) {
          fs.mkdirSync(destParent, { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  /**
   * Restores files copies from checkpoint directory to the workspace root.
   */
  public restoreSnapshot(checkpointId: string, affectedFiles: string[], workspaceRoot: string): void {
    const cpDir = path.join(this.storageDir, checkpointId);
    if (!fs.existsSync(cpDir)) {
      throw new Error(`Snapshot directory not found for checkpoint: ${checkpointId}`);
    }

    for (const file of affectedFiles) {
      const destPath = path.isAbsolute(file) ? file : path.resolve(workspaceRoot, file);
      const relative = path.relative(workspaceRoot, destPath);
      const sourcePath = path.join(cpDir, relative);

      if (fs.existsSync(sourcePath)) {
        const destParent = path.dirname(destPath);
        if (!fs.existsSync(destParent)) {
          fs.mkdirSync(destParent, { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
      } else {
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
      }
    }
  }

  /**
   * Deletes snapshot files from disk.
   */
  public deleteSnapshot(checkpointId: string): void {
    const cpDir = path.join(this.storageDir, checkpointId);
    if (fs.existsSync(cpDir)) {
      fs.rmSync(cpDir, { recursive: true, force: true });
    }
  }
}

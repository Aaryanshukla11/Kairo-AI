import * as fs from 'fs';
import * as path from 'path';
import { Patch, ChangeType, PatchStatus } from './patchTypes';
import { nodeFsAdapter } from '../workspace-engine/fs-adapter';

export class PatchApplier {
  /**
   * Applies the patch changes to the workspace filesystem.
   */
  public apply(patch: Patch, workspaceRoot: string): void {
    const resolvedPath = this.resolvePath(patch.filePath, workspaceRoot);

    switch (patch.changeType) {
      case ChangeType.Create:
      case ChangeType.Update:
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(resolvedPath, patch.newContent || '', 'utf8');
        break;

      case ChangeType.Delete:
        if (fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
        break;

      case ChangeType.Rename:
      case ChangeType.Move:
        const destination = this.resolvePath(patch.metadata?.destination || '', workspaceRoot);
        const destDir = path.dirname(destination);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.renameSync(resolvedPath, destination);
        break;

      default:
        throw new Error(`Unsupported change operation: ${patch.changeType}`);
    }

    patch.status = PatchStatus.Applied;
  }

  /**
   * Reverts changes applied by a patch, rolling back to previous state.
   */
  public rollback(patch: Patch, workspaceRoot: string): void {
    const resolvedPath = this.resolvePath(patch.filePath, workspaceRoot);

    switch (patch.changeType) {
      case ChangeType.Create:
        if (fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
        break;

      case ChangeType.Update:
        fs.writeFileSync(resolvedPath, patch.oldContent || '', 'utf8');
        break;

      case ChangeType.Delete:
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(resolvedPath, patch.oldContent || '', 'utf8');
        break;

      case ChangeType.Rename:
      case ChangeType.Move:
        const destination = this.resolvePath(patch.metadata?.destination || '', workspaceRoot);
        if (fs.existsSync(destination)) {
          fs.renameSync(destination, resolvedPath);
        }
        break;

      default:
        throw new Error(`Unsupported rollback operation: ${patch.changeType}`);
    }

    patch.status = PatchStatus.RolledBack;
  }

  private resolvePath(filePath: string, workspaceRoot: string): string {
    const raw = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
    return nodeFsAdapter.resolveSafeWorkspacePath(raw);
  }
}

export const patchApplier = new PatchApplier();

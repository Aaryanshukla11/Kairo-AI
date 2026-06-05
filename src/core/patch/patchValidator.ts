import * as fs from 'fs';
import * as path from 'path';
import { Patch, ChangeType } from './patchTypes';
import { mergeResolver } from './mergeResolver';

export class PatchValidator {
  /**
   * Performs validation audits on a Patch model.
   */
  public validate(patch: Patch, workspaceRoot: string): void {
    const resolvedPath = path.isAbsolute(patch.filePath) 
      ? patch.filePath 
      : path.resolve(workspaceRoot, patch.filePath);

    if (this.isBinaryFile(resolvedPath)) {
      throw new Error(`Patch validation error: Binary file edits are not supported: "${patch.filePath}"`);
    }

    if (patch.changeType === ChangeType.Update && mergeResolver.hasConflict(resolvedPath, patch.oldContent)) {
      throw new Error(`Patch validation error: Conflict detected on file "${patch.filePath}"`);
    }

    if (patch.changeType === ChangeType.Create && fs.existsSync(resolvedPath)) {
      throw new Error(`Patch validation error: File already exists at path "${patch.filePath}"`);
    }

    if (
      (patch.changeType === ChangeType.Delete || patch.changeType === ChangeType.Update) && 
      !fs.existsSync(resolvedPath)
    ) {
      throw new Error(`Patch validation error: Target file does not exist for modification: "${patch.filePath}"`);
    }

    if (patch.changeType === ChangeType.Update && !patch.diff) {
      throw new Error('Patch validation error: Diff details are missing for update operation');
    }
  }

  private isBinaryFile(filePath: string): boolean {
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.exe', '.zip', '.tar', '.gz'];
    const ext = path.extname(filePath).toLowerCase();
    if (binaryExtensions.includes(ext)) {
      return true;
    }

    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        for (let i = 0; i < Math.min(buffer.length, 512); i++) {
          if (buffer[i] === 0) return true;
        }
      } catch {
        // Safe catch
      }
    }
    return false;
  }
}

export const patchValidator = new PatchValidator();

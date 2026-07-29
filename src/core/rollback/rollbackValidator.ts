import * as fs from 'fs';
import * as path from 'path';
import { RollbackInfo } from './rollbackTypes';
import { Patch, PatchStatus } from '../patch/patchTypes';

export class RollbackValidator {
  /**
   * Validates rollback parameters and checks for external workspace mutations.
   */
  public validate(rollback: RollbackInfo, patch: Patch, workspaceRoot: string): void {
    if (patch.status !== PatchStatus.Applied) {
      throw new Error(`Rollback validation error: Patch "${patch.id}" has status "${patch.status}", expected "Applied"`);
    }

    if (!rollback.previousState || Object.keys(rollback.previousState).length === 0) {
      throw new Error('Rollback validation error: Original state is unavailable');
    }

    for (const filePath of rollback.affectedFiles) {
      const resolvedPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(workspaceRoot, filePath);

      if (fs.existsSync(resolvedPath)) {
        const currentContent = fs.readFileSync(resolvedPath, 'utf8');
        if (patch.newContent !== undefined && currentContent !== patch.newContent) {
          throw new Error(`Rollback validation error: File "${filePath}" was modified externally since the patch was applied`);
        }
      } else {
        if (patch.newContent !== undefined && patch.newContent !== '') {
          throw new Error(`Rollback validation error: Expected file "${filePath}" was deleted externally`);
        }
      }
    }
  }
}

export const rollbackValidator = new RollbackValidator();

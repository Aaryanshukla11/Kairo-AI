import * as fs from 'fs';
import { isProtectedPath } from './ignoreRules';
import { nodeFsAdapter } from '../workspace-engine/fs-adapter';

export class FilesystemValidator {
  /**
   * Guards path target from modifying files in protected directories (like .git, node_modules).
   */
  public validateWritePath(resolvedPath: string): void {
    nodeFsAdapter.resolveSafeWorkspacePath(resolvedPath);
    if (isProtectedPath(resolvedPath)) {
      throw new Error(`Operation rejected: Path "${resolvedPath}" is within a protected directory`);
    }
  }

  /**
   * Validates target does not exist before creating a new file.
   */
  public validateCreateFile(resolvedPath: string): void {
    this.validateWritePath(resolvedPath);
    if (fs.existsSync(resolvedPath)) {
      throw new Error(`Create operation rejected: File already exists at "${resolvedPath}"`);
    }
  }

  /**
   * Validates target exists before updating file content.
   */
  public validateUpdateFile(resolvedPath: string): void {
    this.validateWritePath(resolvedPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Update operation rejected: File does not exist at "${resolvedPath}"`);
    }
    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      throw new Error(`Update operation rejected: Path "${resolvedPath}" is not a file`);
    }
  }

  /**
   * Validates target exists before deleting a file/folder.
   */
  public validateDeleteFile(resolvedPath: string): void {
    this.validateWritePath(resolvedPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Delete operation rejected: Target does not exist at "${resolvedPath}"`);
    }
  }
}

export const filesystemValidator = new FilesystemValidator();

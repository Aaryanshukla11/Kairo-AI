import * as fs from 'fs';
import * as path from 'path';
import { filesystemValidator } from './filesystemValidator';

export class FileWriter {
  /**
   * Creates a new file containing contents.
   */
  public createFile(resolvedPath: string, content: string): void {
    filesystemValidator.validateCreateFile(resolvedPath);
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolvedPath, content, 'utf8');
  }

  /**
   * Updates an existing file.
   */
  public updateFile(resolvedPath: string, content: string): void {
    filesystemValidator.validateUpdateFile(resolvedPath);
    fs.writeFileSync(resolvedPath, content, 'utf8');
  }

  /**
   * Deletes a file.
   */
  public deleteFile(resolvedPath: string): void {
    filesystemValidator.validateDeleteFile(resolvedPath);
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      fs.rmSync(resolvedPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(resolvedPath);
    }
  }

  /**
   * Renames a file or folder.
   */
  public rename(resolvedOldPath: string, resolvedNewPath: string): void {
    filesystemValidator.validateDeleteFile(resolvedOldPath);
    filesystemValidator.validateWritePath(resolvedNewPath);
    if (fs.existsSync(resolvedNewPath)) {
      throw new Error(`Rename operation failed: Target already exists at "${resolvedNewPath}"`);
    }
    fs.renameSync(resolvedOldPath, resolvedNewPath);
  }

  /**
   * Moves a file or folder.
   */
  public move(resolvedOldPath: string, resolvedNewPath: string): void {
    filesystemValidator.validateDeleteFile(resolvedOldPath);
    filesystemValidator.validateWritePath(resolvedNewPath);
    if (fs.existsSync(resolvedNewPath)) {
      throw new Error(`Move operation failed: Target already exists at "${resolvedNewPath}"`);
    }
    const dir = path.dirname(resolvedNewPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(resolvedOldPath, resolvedNewPath);
  }
}

export const fileWriter = new FileWriter();

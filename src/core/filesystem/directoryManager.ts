import * as fs from 'fs';
import { filesystemValidator } from './filesystemValidator';

export class DirectoryManager {
  /**
   * Creates a directory recursively at the target path.
   */
  public createDirectory(resolvedPath: string): void {
    filesystemValidator.validateWritePath(resolvedPath);
    if (fs.existsSync(resolvedPath)) {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        return;
      }
      throw new Error(`Directory creation failed: Path already exists and is not a directory "${resolvedPath}"`);
    }
    fs.mkdirSync(resolvedPath, { recursive: true });
  }
}

export const directoryManager = new DirectoryManager();

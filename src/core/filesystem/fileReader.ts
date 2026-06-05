import * as fs from 'fs';
import { FileStat } from './filesystemTypes';

export class FileReader {
  /**
   * Reads file contents using UTF-8 encoding.
   */
  public readFile(resolvedPath: string): string {
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }
    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      throw new Error(`Path is not a file: ${resolvedPath}`);
    }
    return fs.readFileSync(resolvedPath, 'utf8');
  }

  /**
   * Reads directories returning filenames list.
   */
  public readDirectory(resolvedPath: string): string[] {
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Directory not found: ${resolvedPath}`);
    }
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${resolvedPath}`);
    }
    return fs.readdirSync(resolvedPath);
  }

  /**
   * Checks if target exists.
   */
  public exists(resolvedPath: string): boolean {
    return fs.existsSync(resolvedPath);
  }

  /**
   * Fetches file stat metadata.
   */
  public stat(resolvedPath: string): FileStat {
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Path not found: ${resolvedPath}`);
    }
    const stat = fs.statSync(resolvedPath);
    return {
      size: stat.size,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      mtime: stat.mtimeMs,
      birthtime: stat.birthtimeMs
    };
  }
}

export const fileReader = new FileReader();

import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceSymbol } from './indexTypes';

export class IndexValidator {
  /**
   * Checks extensions and scans first 512 bytes for NULL characters to discard binaries.
   */
  public isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const binaryExtensions = new Set([
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', 
      '.gz', '.exe', '.dll', '.so', '.dylib', '.node', '.woff', '.woff2', 
      '.ttf', '.eot', '.mp3', '.mp4', '.avi', '.mov', '.db', '.sqlite'
    ]);
    if (binaryExtensions.has(ext)) return true;

    if (fs.existsSync(filePath)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.size > 2 * 1024 * 1024) return true;
        const buffer = Buffer.alloc(512);
        const fd = fs.openSync(filePath, 'r');
        const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
        fs.closeSync(fd);

        for (let i = 0; i < bytesRead; i++) {
          if (buffer[i] === 0) return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Disallows duplication of workspace symbols.
   */
  public validateSymbols(symbols: WorkspaceSymbol[]): void {
    const unique = new Set<string>();
    for (const sym of symbols) {
      const key = `${sym.name}:${sym.type}:${sym.filePath}`;
      if (unique.has(key)) {
        throw new Error(`Index validation error: Duplicate symbol detected: "${sym.name}" (${sym.type}) in "${sym.filePath}"`);
      }
      unique.add(key);
    }
  }

  /**
   * Asserts target file path starts with root folder prefix.
   */
  public validatePath(filePath: string, root: string): void {
    const resolved = path.resolve(root, filePath);
    if (!resolved.startsWith(path.resolve(root))) {
      throw new Error(`Index validation error: Invalid path outside root bounds: "${filePath}"`);
    }
  }
}

export const indexValidator = new IndexValidator();

import * as fs from 'fs';
import * as path from 'path';
import { IndexedFile, IndexedFolder } from './indexTypes';
import { detectLanguage } from './languageDetector';
import { indexValidator } from './indexValidator';

export class FileIndexer {
  private ignoreFolders = new Set([
    'node_modules', 'dist', 'build', 'coverage', '.next', '.git', '.cache',
    'temp-context-workspace', 'temp-diagnostics-workspace', 'temp-permission-workspace', 'temp-checkpoint-workspace'
  ]);

  /**
   * Explores workspace directories gathering files meta while filtering binaries and target ignore lists.
   */
  public walk(root: string, currentDir: string = root): { files: IndexedFile[]; folders: IndexedFolder[] } {
    const files: IndexedFile[] = [];
    const folders: IndexedFolder[] = [];

    let entries: string[] = [];
    try {
      entries = fs.readdirSync(currentDir);
    } catch {
      return { files, folders };
    }

    let filesCount = 0;

    for (const entry of entries) {
      if (this.ignoreFolders.has(entry)) continue;

      const absolute = path.join(currentDir, entry);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(absolute);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        const sub = this.walk(root, absolute);
        files.push(...sub.files);
        folders.push(...sub.folders);
      } else if (stat.isFile()) {
        if (indexValidator.isBinaryFile(absolute)) continue;

        filesCount++;
        files.push({
          filePath: path.relative(root, absolute),
          language: detectLanguage(absolute),
          size: stat.size
        });
      }
    }

    folders.push({
      folderPath: path.relative(root, currentDir) || '.',
      filesCount
    });

    return { files, folders };
  }
}

export const fileIndexer = new FileIndexer();

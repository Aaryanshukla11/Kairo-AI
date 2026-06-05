import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ProjectIndex, WorkspaceSymbol, FileDependency } from './indexTypes';
import { fileIndexer } from './fileIndexer';
import { symbolIndexer } from './symbolIndexer';
import { dependencyIndexer } from './dependencyIndexer';
import { configIndexer } from './configIndexer';
import { indexValidator } from './indexValidator';

export class IndexBuilder {
  /**
   * Constructs the unified ProjectIndex compiling path structures, imports maps, and framework types.
   */
  public buildIndex(root: string, workspaceId: string, progressCallback?: (percent: number) => void): ProjectIndex {
    const id = randomUUID();
    
    const walkResult = fileIndexer.walk(root);
    const files = walkResult.files;
    const folders = walkResult.folders;

    const symbols: WorkspaceSymbol[] = [];
    const dependencies: FileDependency[] = [];

    files.forEach((file, idx) => {
      const absolute = path.resolve(root, file.filePath);
      indexValidator.validatePath(file.filePath, root);

      try {
        const content = fs.readFileSync(absolute, 'utf8');
        
        const fileSymbols = symbolIndexer.indexSymbols(file.filePath, content);
        symbols.push(...fileSymbols);

        const fileDeps = dependencyIndexer.indexDependencies(file.filePath, content);
        dependencies.push(...fileDeps);
      } catch {
        // Skip
      }

      if (progressCallback) {
        const pct = Math.floor(((idx + 1) / files.length) * 100);
        progressCallback(pct);
      }
    });

    indexValidator.validateSymbols(symbols);

    const config = configIndexer.indexConfig(root);

    return {
      id,
      workspaceId,
      files,
      folders,
      symbols,
      dependencies,
      framework: config.framework,
      language: config.language,
      updatedAt: Date.now()
    };
  }
}

export const indexBuilder = new IndexBuilder();

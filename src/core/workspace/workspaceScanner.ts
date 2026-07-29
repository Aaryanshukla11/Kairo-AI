import * as fs from 'fs';
import * as path from 'path';
import { isIgnored } from './ignoreRules';

export class WorkspaceScanner {
  /**
   * Scans the workspace directory to find directories, files, and config targets at the root.
   */
  public scanRoot(rootPath: string): { rootFiles: string[]; hasGit: boolean; configs: string[] } {
    const rootFiles: string[] = [];
    let hasGit = false;
    const configs: string[] = [];

    if (!fs.existsSync(rootPath)) {
      return { rootFiles, hasGit, configs };
    }

    try {
      const items = fs.readdirSync(rootPath);
      for (const item of items) {
        if (item === '.git') {
          hasGit = true;
          continue;
        }

        if (isIgnored(item)) {
          continue;
        }

        rootFiles.push(item);

        // Check if it is a configuration file
        if (
          item.startsWith('.') || 
          item.endsWith('.config.js') || 
          item.endsWith('.config.ts') || 
          item.endsWith('.config.mjs') || 
          item.endsWith('.json') || 
          item.endsWith('.yaml') || 
          item.endsWith('.yml') ||
          item === 'package.json' ||
          item === 'Cargo.toml' ||
          item === 'pyproject.toml' ||
          item === 'go.mod'
        ) {
          configs.push(item);
        }
      }
    } catch (e) {
      console.error('Error scanning root:', e);
    }

    return { rootFiles, hasGit, configs };
  }

  /**
   * Performs a lightweight scan of source files to identify predominant programming language extensions.
   */
  public detectSourceExtensions(rootPath: string): string[] {
    const extensions = new Set<string>();
    
    const walk = (dir: string, depth = 0) => {
      if (depth > 3) return; // Limit depth to keep it extremely fast
      if (!fs.existsSync(dir)) return;

      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            if (isIgnored(item.name)) continue;
            walk(path.join(dir, item.name), depth + 1);
          } else {
            const ext = path.extname(item.name).toLowerCase();
            if (ext) {
              extensions.add(ext);
            }
          }
        }
      } catch (e) {
        // Ignore listing errors
      }
    };

    walk(rootPath);
    return Array.from(extensions);
  }
}

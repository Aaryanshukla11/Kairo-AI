import * as fs from 'fs';
import * as path from 'path';
import { ContextFileInfo } from './contextTypes';

export class ContextResolver {
  /**
   * Resolves files details, calculating character token counts and skipping ignored/duplicated folders.
   */
  public resolveFiles(root: string, filePaths: string[]): ContextFileInfo[] {
    const resolved: ContextFileInfo[] = [];
    const absoluteUnique = new Set<string>();

    for (const filePath of filePaths) {
      const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
      if (absoluteUnique.has(absolute)) continue;
      absoluteUnique.add(absolute);

      const isIgnored = absolute.includes('node_modules') || absolute.includes('.git') || absolute.includes('.aiidle/checkpoints');
      if (isIgnored) continue;

      if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
        try {
          const content = fs.readFileSync(absolute, 'utf8');
          const size = Buffer.byteLength(content, 'utf8');
          const tokenEstimate = Math.ceil(content.length / 4);
          
          resolved.push({
            filePath: path.relative(root, absolute),
            content,
            size,
            tokenEstimate
          });
        } catch {
          // Skip
        }
      }
    }

    return resolved;
  }

  /**
   * Reads and parses workspace configuration package.json details.
   */
  public resolvePackageJson(root: string): any {
    const pkg = path.join(root, 'package.json');
    if (fs.existsSync(pkg)) {
      try {
        return JSON.parse(fs.readFileSync(pkg, 'utf8'));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

export const contextResolver = new ContextResolver();

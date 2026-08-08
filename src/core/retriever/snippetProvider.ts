import * as fs from 'fs';
import * as path from 'path';

export class SnippetProvider {
  /**
   * Extracts a code snippet around a specific line in a file.
   */
  public extractSymbolSnippet(workspacePath: string, filePath: string, line: number, count: number = 15): string {
    const absolutePath = path.resolve(workspacePath, filePath);
    try {
      if (fs.existsSync(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf8');
        const lines = content.split(/\r?\n/);
        const start = Math.max(0, line - 1);
        const end = Math.min(lines.length, start + count);
        return lines.slice(start, end).join('\n');
      }
    } catch (err) {
      console.warn(`[SnippetProvider] Failed to read symbol snippet from ${absolutePath}:`, err);
    }
    return '';
  }

  /**
   * Extracts the top lines of a file as a snippet.
   */
  public extractFileSnippet(workspacePath: string, filePath: string, count: number = 20): string {
    const absolutePath = path.resolve(workspacePath, filePath);
    try {
      if (fs.existsSync(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf8');
        const lines = content.split(/\r?\n/);
        return lines.slice(0, count).join('\n');
      }
    } catch (err) {
      console.warn(`[SnippetProvider] Failed to read file snippet from ${absolutePath}:`, err);
    }
    return '';
  }
}

export const snippetProvider = new SnippetProvider();

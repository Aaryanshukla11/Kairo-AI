import { execSync } from 'child_process';

/**
 * Returns raw diff details against HEAD, or empty string if unchanged.
 */
export function getDiffPreview(rootPath: string, filePath?: string): string {
  try {
    const args = filePath ? ` -- "${filePath}"` : '';
    const diff = execSync(`git diff HEAD${args}`, {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return diff;
  } catch (err) {
    return '';
  }
}

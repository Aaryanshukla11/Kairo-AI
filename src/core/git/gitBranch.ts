import { execSync } from 'child_process';

/**
 * Returns the name of the current active branch.
 */
export function getBranchName(rootPath: string): string {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return branch.trim();
  } catch (err) {
    return 'unknown';
  }
}

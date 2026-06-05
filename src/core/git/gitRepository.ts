import { execSync } from 'child_process';
import { GitRepositoryInfo } from './gitTypes';
import { getBranchName } from './gitBranch';
import { getRepositoryStatus } from './gitStatus';

export class GitRepository {
  constructor(private rootPath: string) {}

  /**
   * Compiles the high-level repository state info details.
   */
  public getInfo(): GitRepositoryInfo {
    const branch = getBranchName(this.rootPath);
    const statusInfo = getRepositoryStatus(this.rootPath);

    let lastCommit = '';
    let ahead = 0;
    let behind = 0;

    try {
      lastCommit = execSync('git rev-parse HEAD', { cwd: this.rootPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      // Silent catch
    }

    try {
      const abOutput = execSync('git rev-list --left-right --count HEAD...@{u}', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
      const parts = abOutput.split(/\s+/);
      if (parts.length === 2) {
        ahead = parseInt(parts[0], 10) || 0;
        behind = parseInt(parts[1], 10) || 0;
      }
    } catch {
      // Silent catch
    }

    return {
      root: this.rootPath,
      branch,
      status: statusInfo.isDirty ? 'Dirty' : 'Clean',
      isDirty: statusInfo.isDirty,
      ahead,
      behind,
      lastCommit: lastCommit || undefined
    };
  }

  public getRootPath(): string {
    return this.rootPath;
  }
}

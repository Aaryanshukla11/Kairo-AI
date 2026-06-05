import { execSync } from 'child_process';
import { GitStatusInfo, GitChangedFile } from './gitTypes';
import { getBranchName } from './gitBranch';

/**
 * Returns porcelain status detailing changed files and repository dirty states.
 */
export function getRepositoryStatus(rootPath: string): GitStatusInfo {
  const branch = getBranchName(rootPath);
  const changedFiles: GitChangedFile[] = [];

  try {
    const statusOutput = execSync('git status --porcelain', {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const lines = statusOutput.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;

      const code = line.substring(0, 2);
      const filePath = line.substring(3).trim();
      let status: 'Added' | 'Modified' | 'Deleted' | 'Untracked' = 'Untracked';

      if (code.includes('M')) {
        status = 'Modified';
      } else if (code.includes('D')) {
        status = 'Deleted';
      } else if (code.includes('A')) {
        status = 'Added';
      } else if (code.includes('?')) {
        status = 'Untracked';
      }

      changedFiles.push({ path: filePath, status });
    }
  } catch (err) {
    // Fail-safe empty returns
  }

  return {
    branch,
    isDirty: changedFiles.length > 0,
    changedFiles
  };
}

import { execSync } from 'child_process';
import { GitCommitInfo } from './gitTypes';
import { gitValidator } from './gitValidator';

/**
 * Stages and commits changes using approval validations.
 */
export function createCommit(rootPath: string, message: string): string {
  gitValidator.validateCommitMessage(message);
  gitValidator.validateNotLocked(rootPath);

  try {
    execSync('git add -A', { cwd: rootPath, stdio: 'ignore' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: rootPath,
      stdio: 'ignore'
    });

    const hash = execSync('git rev-parse HEAD', { cwd: rootPath, encoding: 'utf8' }).trim();
    return hash;
  } catch (err: any) {
    throw new Error(`Git commit failed: ${err.message}`);
  }
}

/**
 * Returns latest commits history.
 */
export function getCommitHistory(rootPath: string, limit = 5): GitCommitInfo[] {
  const history: GitCommitInfo[] = [];
  try {
    const logOutput = execSync(`git log -n ${limit} --pretty=format:"%H|%an|%ad|%s"`, {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const lines = logOutput.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;

      const [hash, author, date, message] = line.split('|');
      history.push({ hash, author, date, message });
    }
  } catch (err) {
    // Fail-safe empty returns
  }
  return history;
}

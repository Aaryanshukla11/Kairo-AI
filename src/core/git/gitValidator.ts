import * as fs from 'fs';
import * as path from 'path';

export class GitValidator {
  /**
   * Verifies if the target folder contains a .git directory.
   */
  public validateRepository(rootPath: string): void {
    const gitDir = path.join(rootPath, '.git');
    if (!fs.existsSync(gitDir)) {
      throw new Error(`Git Engine error: "${rootPath}" is not a valid Git repository`);
    }
  }

  /**
   * Verifies a commit message is provided and non-empty.
   */
  public validateCommitMessage(message: string): void {
    if (!message || !message.trim()) {
      throw new Error('Git Engine error: Commit message cannot be empty');
    }
  }

  /**
   * Detects if an active lock is present inside the repository.
   */
  public validateNotLocked(rootPath: string): void {
    const lockFile = path.join(rootPath, '.git', 'index.lock');
    if (fs.existsSync(lockFile)) {
      throw new Error('Git Engine error: Repository is locked because .git/index.lock exists');
    }
  }
}

export const gitValidator = new GitValidator();

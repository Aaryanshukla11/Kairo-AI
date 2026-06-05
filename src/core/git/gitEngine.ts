import { GitEvents } from './gitEvents';
import { GitRepository } from './gitRepository';
import { gitValidator } from './gitValidator';
import { getRepositoryStatus } from './gitStatus';
import { getDiffPreview } from './gitDiff';
import { createCommit, getCommitHistory } from './gitCommit';
import { GitRepositoryInfo, GitStatusInfo, GitCommitInfo, GitEventType, GitEventListener } from './gitTypes';

export class GitEngine {
  private events = new GitEvents();
  private repository: GitRepository;

  constructor(private workspaceRoot: string) {
    gitValidator.validateRepository(workspaceRoot);
    this.repository = new GitRepository(workspaceRoot);
    this.events.emit(GitEventType.RepositoryLoaded, workspaceRoot, { root: workspaceRoot });
  }

  /**
   * Subscribes to Git engine events.
   */
  public subscribe(listener: GitEventListener): () => void {
    return this.events.subscribe(listener);
  }

  public getRepositoryInfo(): GitRepositoryInfo {
    return this.repository.getInfo();
  }

  public getStatus(): GitStatusInfo {
    const status = getRepositoryStatus(this.workspaceRoot);
    this.events.emit(GitEventType.StatusChanged, this.workspaceRoot, { status });
    return status;
  }

  public getDiff(filePath?: string): string {
    const diff = getDiffPreview(this.workspaceRoot, filePath);
    this.events.emit(GitEventType.DiffGenerated, this.workspaceRoot, { diff, filePath });
    return diff;
  }

  /**
   * Commits changes after validation checks.
   */
  public commit(message: string): string {
    gitValidator.validateCommitMessage(message);
    const hash = createCommit(this.workspaceRoot, message);
    this.events.emit(GitEventType.CommitCreated, this.workspaceRoot, { hash, message });
    return hash;
  }

  public getHistory(limit = 5): GitCommitInfo[] {
    return getCommitHistory(this.workspaceRoot, limit);
  }
}

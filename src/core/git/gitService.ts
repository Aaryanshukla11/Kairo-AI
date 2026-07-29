import * as vscode from 'vscode';
import { GitEngine } from './gitEngine';
import { GitRepositoryInfo, GitStatusInfo, GitCommitInfo, GitEventListener } from './gitTypes';

export class GitService {
  private activeEngine: GitEngine | null = null;

  private getEngine(): GitEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Git Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new GitEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active repository events.
   */
  public subscribe(listener: GitEventListener): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public getRepositoryInfo(): GitRepositoryInfo {
    return this.getEngine().getRepositoryInfo();
  }

  public getStatus(): GitStatusInfo {
    return this.getEngine().getStatus();
  }

  public getDiff(filePath?: string): string {
    return this.getEngine().getDiff(filePath);
  }

  public commit(message: string): string {
    return this.getEngine().commit(message);
  }

  public getHistory(limit = 5): GitCommitInfo[] {
    return this.getEngine().getHistory(limit);
  }
}

export const gitService = new GitService();

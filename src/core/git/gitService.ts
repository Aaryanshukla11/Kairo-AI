import * as vscode from 'vscode';
import { GitEngine } from './gitEngine';
import { GitRepositoryInfo, GitStatusInfo, GitCommitInfo, GitEventListener } from './gitTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class GitService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: GitEngine | null = null;
  private pendingSubscriptions: GitEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new GitEngine(rootPath);
    this.state = 'READY';
    // Flush pending subscriptions
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): GitEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active repository events.
   */
  public subscribe(listener: GitEventListener): () => void {
    const engine = this.getEngine();
    if (!engine) {
      this.pendingSubscriptions.push(listener);
      return () => {
        this.pendingSubscriptions = this.pendingSubscriptions.filter(l => l !== listener);
      };
    }
    return engine.subscribe(listener);
  }

  // --- Wrapper APIs ---

  public getRepositoryInfo(): GitRepositoryInfo {
    const engine = this.getEngine();
    if (!engine) {
      return { root: '', branch: 'unknown', status: 'unknown', isDirty: false, ahead: 0, behind: 0 };
    }
    return engine.getRepositoryInfo();
  }

  public getStatus(): GitStatusInfo {
    const engine = this.getEngine();
    if (!engine) {
      return { branch: 'unknown', isDirty: false, changedFiles: [] };
    }
    return engine.getStatus();
  }

  public getDiff(filePath?: string): string {
    const engine = this.getEngine();
    if (!engine) {
      return '';
    }
    return engine.getDiff(filePath);
  }

  public commit(message: string): string {
    const engine = this.getEngine();
    if (!engine) {
      return '';
    }
    return engine.commit(message);
  }

  public getHistory(limit = 5): GitCommitInfo[] {
    const engine = this.getEngine();
    if (!engine) {
      return [];
    }
    return engine.getHistory(limit);
  }
}

export const gitService = new GitService();
export default gitService;

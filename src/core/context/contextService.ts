import * as vscode from 'vscode';
import { ContextEngine } from './contextEngine';
import { ProjectContext, ContextSelectionInfo, ContextPlannerInfo, ContextExecutionInfo, ContextGitInfo } from './contextTypes';
import { Diagnostic } from '../diagnostics/diagnosticsTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class ContextService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: ContextEngine | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new ContextEngine(rootPath);
    this.state = 'READY';
    for (const listener of this.pendingSubscriptions) {
      this.activeEngine.subscribe(listener);
    }
    this.pendingSubscriptions = [];
  }

  public reset(): void {
    this.activeEngine = null;
    this.state = 'WAITING_FOR_WORKSPACE';
  }

  private getEngine(): ContextEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active context events.
   */
  public subscribe(listener: any): () => void {
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

  public buildContext(params: {
    filePaths: string[];
    selection: ContextSelectionInfo;
    planner: ContextPlannerInfo;
    execution: ContextExecutionInfo;
    git: ContextGitInfo;
    diagnostics: Diagnostic[];
    limitBytes?: number;
  }): ProjectContext {
    const engine = this.getEngine();
    if (!engine) {
      return {
        id: 'none',
        workspace: { rootPath: '', name: '', folderCount: 0 },
        files: [],
        selection: params.selection,
        planner: params.planner,
        execution: params.execution,
        git: params.git,
        diagnostics: params.diagnostics,
        metadata: { tokenEstimateTotal: 0, sizeBytesTotal: 0, limitBytes: params.limitBytes || 0 },
        timestamp: Date.now()
      };
    }
    return engine.buildContext(params);
  }

  public getActiveContext(): ProjectContext | null {
    const engine = this.getEngine();
    if (!engine) return null;
    return engine.getActiveContext();
  }

  public expireContext(): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.expireContext();
  }
}

export const contextService = new ContextService();
export default contextService;

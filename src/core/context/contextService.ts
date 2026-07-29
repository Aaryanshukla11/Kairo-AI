import * as vscode from 'vscode';
import { ContextEngine } from './contextEngine';
import { ProjectContext, ContextSelectionInfo, ContextPlannerInfo, ContextExecutionInfo, ContextGitInfo } from './contextTypes';
import { Diagnostic } from '../diagnostics/diagnosticsTypes';

export class ContextService {
  private activeEngine: ContextEngine | null = null;

  private getEngine(): ContextEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Context Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new ContextEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active context events.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
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
    return this.getEngine().buildContext(params);
  }

  public getActiveContext(): ProjectContext | null {
    return this.getEngine().getActiveContext();
  }

  public expireContext(): void {
    this.getEngine().expireContext();
  }
}

export const contextService = new ContextService();

import * as vscode from 'vscode';
import { ToolEngine } from './toolEngine';
import { ToolResult } from './toolTypes';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class ToolService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: ToolEngine | null = null;
  private pendingSubscriptions: any[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new ToolEngine();
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

  private getEngine(): ToolEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Tool Calling changes.
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

  public async executeTool(toolId: string, args: Record<string, any>): Promise<ToolResult> {
    const engine = this.getEngine();
    if (!engine) {
      return { success: false, error: 'Workspace Tool Service: No workspace folder is open' };
    }
    return engine.executeTool(toolId, args);
  }

  public getHistory(): any[] {
    const engine = this.getEngine();
    if (!engine) {
      return [];
    }
    return engine.getHistory();
  }
}

export const toolService = new ToolService();
export default toolService;

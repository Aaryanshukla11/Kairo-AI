import * as vscode from 'vscode';
import { ToolEngine } from './toolEngine';
import { ToolResult } from './toolTypes';

export class ToolService {
  private activeEngine: ToolEngine | null = null;

  private getEngine(): ToolEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Tool Service: No workspace folder is open');
    }

    if (!this.activeEngine) {
      this.activeEngine = new ToolEngine();
    }
    return this.activeEngine;
  }

  /**
   * Subscribes a listener to Tool Calling changes.
   */
  public subscribe(listener: any): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public async executeTool(toolId: string, args: Record<string, any>): Promise<ToolResult> {
    return this.getEngine().executeTool(toolId, args);
  }

  public getHistory(): any[] {
    return this.getEngine().getHistory();
  }
}

export const toolService = new ToolService();

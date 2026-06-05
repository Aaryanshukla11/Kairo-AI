import * as vscode from 'vscode';
import { workspaceEngine } from './workspaceEngine';
import { WorkspaceSummary } from './workspaceTypes';

export class WorkspaceService {
  /**
   * Retrieves the active workspace path.
   * If multiple folders are open, returns the first folder path.
   * If none exist, returns null.
   */
  public getWorkspaceRoot(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }
    return folders[0].uri.fsPath;
  }

  /**
   * Generates a WorkspaceSummary for the active workspace.
   * If no workspace exists, returns 'Workspace Not Found'.
   */
  public getWorkspaceSummary(): WorkspaceSummary | string {
    const root = this.getWorkspaceRoot();
    if (!root) {
      return 'Workspace Not Found';
    }

    try {
      return workspaceEngine.getSummary(root);
    } catch (e) {
      return 'Workspace Not Found';
    }
  }
}

export const workspaceService = new WorkspaceService();

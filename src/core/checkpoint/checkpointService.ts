import * as vscode from 'vscode';
import { CheckpointEngine } from './checkpointEngine';
import { CheckpointInfo, CheckpointEventListener } from './checkpointTypes';
import { checkpointRegistry } from './checkpointRegistry';

export class CheckpointService {
  private activeEngine: CheckpointEngine | null = null;

  private getEngine(): CheckpointEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Checkpoint Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new CheckpointEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active checkpoint events.
   */
  public subscribe(listener: CheckpointEventListener): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public createCheckpoint(
    workspaceId: string, 
    transactionId: string, 
    affectedFiles: string[], 
    metadata?: Record<string, any>
  ): CheckpointInfo {
    return this.getEngine().createCheckpoint(workspaceId, transactionId, affectedFiles, metadata);
  }

  public restoreCheckpoint(id: string): void {
    this.getEngine().restoreCheckpoint(id);
  }

  public deleteCheckpoint(id: string): void {
    this.getEngine().deleteCheckpoint(id);
  }

  public expireCheckpoint(id: string): void {
    this.getEngine().expireCheckpoint(id);
  }

  public getCheckpoint(id: string): CheckpointInfo | undefined {
    return checkpointRegistry.getById(id);
  }

  public getHistory(): CheckpointInfo[] {
    return checkpointRegistry.getAll();
  }
}

export const checkpointService = new CheckpointService();

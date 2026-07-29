import * as vscode from 'vscode';
import { RollbackEngine } from './rollbackEngine';
import { RollbackInfo, RollbackEventListener, RollbackPreviewData } from './rollbackTypes';
import { patchService } from '../patch/patchService';
import { rollbackRegistry } from './rollbackRegistry';
import { rollbackHistory } from './rollbackHistory';

export class RollbackService {
  private activeEngine: RollbackEngine | null = null;

  private getEngine(): RollbackEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Rollback Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new RollbackEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active rollback transaction event updates.
   */
  public subscribe(listener: RollbackEventListener): () => void {
    return this.getEngine().subscribe(listener);
  }

  // --- Wrapper APIs ---

  public createRollback(patchId: string): RollbackInfo {
    const patch = patchService.getPatch(patchId);
    if (!patch) throw new Error(`Patch not found to configure rollback: ${patchId}`);
    return this.getEngine().createRollback(patch);
  }

  public executeRollback(rollbackId: string): void {
    this.getEngine().executeRollback(rollbackId, patchService);
  }

  public getPreview(rollbackId: string): RollbackPreviewData {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback) throw new Error(`Rollback not found: ${rollbackId}`);
    const patch = patchService.getPatch(rollback.patchId);
    if (!patch) throw new Error(`Patch associated with rollback not found: ${rollback.patchId}`);
    return this.getEngine().getPreview(rollbackId, patch);
  }

  public getRollback(rollbackId: string): RollbackInfo | undefined {
    return rollbackRegistry.getById(rollbackId);
  }

  public getHistory(): RollbackInfo[] {
    return rollbackRegistry.getAll();
  }

  public getHistoryLog(): RollbackInfo[] {
    return rollbackHistory.getLog();
  }
}

export const rollbackService = new RollbackService();

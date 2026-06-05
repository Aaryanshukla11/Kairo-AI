import * as vscode from 'vscode';
import { RollbackEngine } from './rollbackEngine';
import { RollbackInfo, RollbackEventListener, RollbackPreviewData } from './rollbackTypes';
import { patchService } from '../patch/patchService';
import { rollbackRegistry } from './rollbackRegistry';
import { rollbackHistory } from './rollbackHistory';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class RollbackService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: RollbackEngine | null = null;
  private pendingSubscriptions: RollbackEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new RollbackEngine(rootPath);
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

  private getEngine(): RollbackEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active rollback transaction event updates.
   */
  public subscribe(listener: RollbackEventListener): () => void {
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

  public createRollback(patchId: string): RollbackInfo {
    const patch = patchService.getPatch(patchId);
    if (!patch) throw new Error(`Patch not found to configure rollback: ${patchId}`);
    const engine = this.getEngine();
    if (!engine) {
      throw new Error('Workspace Rollback Service: No workspace folder is open');
    }
    return engine.createRollback(patch);
  }

  public executeRollback(rollbackId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.executeRollback(rollbackId, patchService);
  }

  public getPreview(rollbackId: string): RollbackPreviewData {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback) throw new Error(`Rollback not found: ${rollbackId}`);
    const patch = patchService.getPatch(rollback.patchId);
    if (!patch) throw new Error(`Patch associated with rollback not found: ${rollback.patchId}`);
    const engine = this.getEngine();
    if (!engine) {
      throw new Error('Workspace Rollback Service: No workspace folder is open');
    }
    return engine.getPreview(rollbackId, patch);
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
export default rollbackService;

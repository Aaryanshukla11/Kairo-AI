import * as vscode from 'vscode';
import { CheckpointEngine } from './checkpointEngine';
import { CheckpointInfo, CheckpointEventListener, CheckpointStatus } from './checkpointTypes';
import { checkpointRegistry } from './checkpointRegistry';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class CheckpointService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: CheckpointEngine | null = null;
  private pendingSubscriptions: CheckpointEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new CheckpointEngine(rootPath);
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

  private getEngine(): CheckpointEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active checkpoint events.
   */
  public subscribe(listener: CheckpointEventListener): () => void {
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

  public createCheckpoint(
    workspaceId: string, 
    transactionId: string, 
    affectedFiles: string[], 
    metadata?: Record<string, any>
  ): CheckpointInfo {
    const engine = this.getEngine();
    if (!engine) {
      const fallback: CheckpointInfo = {
        id: `chk-${Date.now()}`,
        workspaceId,
        transactionId,
        timestamp: Date.now(),
        affectedFiles,
        status: CheckpointStatus.Created,
        workspaceHash: ''
      };
      return fallback;
    }
    return engine.createCheckpoint(workspaceId, transactionId, affectedFiles, metadata);
  }

  public restoreCheckpoint(id: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.restoreCheckpoint(id);
  }

  public deleteCheckpoint(id: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.deleteCheckpoint(id);
  }

  public expireCheckpoint(id: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.expireCheckpoint(id);
  }

  public getCheckpoint(id: string): CheckpointInfo | undefined {
    return checkpointRegistry.getById(id);
  }

  public getHistory(): CheckpointInfo[] {
    return checkpointRegistry.getAll();
  }
}

export const checkpointService = new CheckpointService();
export default checkpointService;

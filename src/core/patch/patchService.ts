import * as vscode from 'vscode';
import { PatchEngine } from './patchEngine';
import { Patch, ChangeType, PatchEventListener } from './patchTypes';
import { patchRegistry } from './patchRegistry';
import { ILazyWorkspaceService, WorkspaceLifecycleState, workspaceLifecycleManager } from '../workspace/workspaceLifecycleManager';

export class PatchService implements ILazyWorkspaceService {
  public state: WorkspaceLifecycleState = 'NOT_INITIALIZED';
  private activeEngine: PatchEngine | null = null;
  private pendingSubscriptions: PatchEventListener[] = [];

  constructor() {
    workspaceLifecycleManager.registerService(this);
  }

  public initialize(rootPath: string): void {
    this.activeEngine = new PatchEngine(rootPath);
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

  private getEngine(): PatchEngine | null {
    return this.activeEngine;
  }

  /**
   * Subscribes to active patch lifecycle events.
   */
  public subscribe(listener: PatchEventListener): () => void {
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

  public createPatch(
    operationId: string, 
    filePath: string, 
    changeType: ChangeType, 
    oldContent?: string, 
    newContent?: string, 
    metadata?: Record<string, any>
  ): Patch {
    const engine = this.getEngine();
    if (!engine) {
      const draft: Patch = {
        patchId: `patch-${Date.now()}`,
        operationId,
        filePath,
        changeType,
        status: 'Draft',
        oldContent: oldContent || '',
        newContent: newContent || '',
        timestamp: Date.now()
      };
      return draft;
    }
    return engine.createPatch(operationId, filePath, changeType, oldContent, newContent, metadata);
  }

  public validatePatch(patchId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.validatePatch(patchId);
  }

  public approvePatch(patchId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.approvePatch(patchId);
  }

  public rejectPatch(patchId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.rejectPatch(patchId);
  }

  public applyPatch(patchId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.applyPatch(patchId);
  }

  public rollbackPatch(patchId: string): void {
    const engine = this.getEngine();
    if (!engine) return;
    engine.rollbackPatch(patchId);
  }

  public getPatch(patchId: string): Patch | undefined {
    return patchRegistry.getById(patchId);
  }

  public getHistory(): Patch[] {
    return patchRegistry.getHistory();
  }
}

export const patchService = new PatchService();
export default patchService;

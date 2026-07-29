import * as vscode from 'vscode';
import { PatchEngine } from './patchEngine';
import { Patch, ChangeType, PatchEventListener } from './patchTypes';
import { patchRegistry } from './patchRegistry';

export class PatchService {
  private activeEngine: PatchEngine | null = null;

  private getEngine(): PatchEngine {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error('Workspace Patch Service: No workspace folder is open');
    }

    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new PatchEngine(root);
    }
    return this.activeEngine;
  }

  /**
   * Subscribes to active patch lifecycle events.
   */
  public subscribe(listener: PatchEventListener): () => void {
    return this.getEngine().subscribe(listener);
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
    return this.getEngine().createPatch(operationId, filePath, changeType, oldContent, newContent, metadata);
  }

  public validatePatch(patchId: string): void {
    this.getEngine().validatePatch(patchId);
  }

  public approvePatch(patchId: string): void {
    this.getEngine().approvePatch(patchId);
  }

  public rejectPatch(patchId: string): void {
    this.getEngine().rejectPatch(patchId);
  }

  public applyPatch(patchId: string): void {
    this.getEngine().applyPatch(patchId);
  }

  public rollbackPatch(patchId: string): void {
    this.getEngine().rollbackPatch(patchId);
  }

  public getPatch(patchId: string): Patch | undefined {
    return patchRegistry.getById(patchId);
  }

  public getHistory(): Patch[] {
    return patchRegistry.getHistory();
  }
}

export const patchService = new PatchService();

import { Patch, PatchStatus, PatchEventType, PatchEventListener, ChangeType } from './patchTypes';
import { patchBuilder } from './patchBuilder';
import { patchValidator } from './patchValidator';
import { patchApplier } from './patchApplier';
import { patchRegistry } from './patchRegistry';

export class PatchEngine {
  private listeners = new Set<PatchEventListener>();

  constructor(private workspaceRoot: string) {}

  /**
   * Subscribes to Patch event updates.
   */
  public subscribe(listener: PatchEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: PatchEventType, patchId: string, payload?: any): void {
    const event = {
      type,
      patchId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in patch event listener:', err);
      }
    }
  }

  // --- Core Lifecycle ---

  public createPatch(
    operationId: string, 
    filePath: string, 
    changeType: ChangeType, 
    oldContent?: string, 
    newContent?: string, 
    metadata?: Record<string, any>
  ): Patch {
    const patch = patchBuilder.build(operationId, filePath, changeType, oldContent, newContent, metadata);
    patchRegistry.register(patch);
    this.emit(PatchEventType.PatchCreated, patch.id, { patch });

    try {
      this.validatePatch(patch.id);
    } catch {
      patch.status = PatchStatus.Generated;
    }

    return patch;
  }

  public validatePatch(patchId: string): void {
    const patch = patchRegistry.getById(patchId);
    if (!patch) throw new Error(`Patch not found: ${patchId}`);

    patchValidator.validate(patch, this.workspaceRoot);
    patch.status = PatchStatus.Validated;
    this.emit(PatchEventType.PatchValidated, patch.id, { patch });
  }

  public approvePatch(patchId: string): void {
    const patch = patchRegistry.getById(patchId);
    if (!patch) throw new Error(`Patch not found: ${patchId}`);

    patch.status = PatchStatus.Approved;
    this.emit(PatchEventType.PatchApproved, patch.id, { patch });
  }

  public rejectPatch(patchId: string): void {
    const patch = patchRegistry.getById(patchId);
    if (!patch) throw new Error(`Patch not found: ${patchId}`);

    patch.status = PatchStatus.Rejected;
    this.emit(PatchEventType.PatchRejected, patch.id, { patch });
  }

  public applyPatch(patchId: string): void {
    const patch = patchRegistry.getById(patchId);
    if (!patch) throw new Error(`Patch not found: ${patchId}`);

    if (patch.status !== PatchStatus.Approved && patch.status !== PatchStatus.Validated) {
      throw new Error(`Patch cannot be applied in status: ${patch.status}`);
    }

    patchApplier.apply(patch, this.workspaceRoot);
    this.emit(PatchEventType.PatchApplied, patch.id, { patch });
  }

  public rollbackPatch(patchId: string): void {
    const patch = patchRegistry.getById(patchId);
    if (!patch) throw new Error(`Patch not found: ${patchId}`);

    if (patch.status !== PatchStatus.Applied) {
      throw new Error(`Patch cannot be rolled back in status: ${patch.status}`);
    }

    patchApplier.rollback(patch, this.workspaceRoot);
    this.emit(PatchEventType.PatchRolledBack, patch.id, { patch });
  }
}

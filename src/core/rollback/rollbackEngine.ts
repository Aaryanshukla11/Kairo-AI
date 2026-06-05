import { RollbackInfo, RollbackStatus, RollbackEventType, RollbackEventListener, RollbackPreviewData } from './rollbackTypes';
import { rollbackBuilder } from './rollbackBuilder';
import { rollbackValidator } from './rollbackValidator';
import { rollbackRegistry } from './rollbackRegistry';
import { rollbackHistory } from './rollbackHistory';
import { Patch } from '../patch/patchTypes';

export class RollbackEngine {
  private listeners = new Set<RollbackEventListener>();

  constructor(private workspaceRoot: string) {}

  /**
   * Subscribes to Rollback event updates.
   */
  public subscribe(listener: RollbackEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: RollbackEventType, rollbackId: string, payload?: any): void {
    const event = {
      type,
      rollbackId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in rollback event listener:', err);
      }
    }
  }

  // --- Core API ---

  public createRollback(patch: Patch): RollbackInfo {
    const rollback = rollbackBuilder.build(patch);
    rollbackRegistry.register(rollback);
    this.emit(RollbackEventType.RollbackCreated, rollback.id, { rollback });

    try {
      rollbackValidator.validate(rollback, patch, this.workspaceRoot);
      rollback.status = RollbackStatus.Ready;
      this.emit(RollbackEventType.RollbackValidated, rollback.id, { rollback });
    } catch (error: any) {
      rollback.status = RollbackStatus.Failed;
      rollback.metadata = { error: error.message };
      this.emit(RollbackEventType.RollbackFailed, rollback.id, { error: error.message });
      throw error;
    }

    return rollback;
  }

  public executeRollback(rollbackId: string, patchService: any): void {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback) throw new Error(`Rollback not found: ${rollbackId}`);

    if (rollback.status !== RollbackStatus.Ready) {
      throw new Error(`Rollback is not ready, current status: ${rollback.status}`);
    }

    rollback.status = RollbackStatus.Executing;
    this.emit(RollbackEventType.RollbackStarted, rollback.id);

    try {
      patchService.rollbackPatch(rollback.patchId);

      rollback.status = RollbackStatus.Completed;
      this.emit(RollbackEventType.RollbackCompleted, rollback.id);
      rollbackHistory.log(rollback);
    } catch (error: any) {
      rollback.status = RollbackStatus.Failed;
      rollback.metadata = { ...rollback.metadata, error: error.message };
      this.emit(RollbackEventType.RollbackFailed, rollback.id, { error: error.message });
      rollbackHistory.log(rollback);
      throw error;
    }
  }

  public getPreview(rollbackId: string, patch: Patch): RollbackPreviewData {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback) throw new Error(`Rollback not found: ${rollbackId}`);

    let linesRestored = 0;
    let linesRemoved = 0;
    
    if (patch.diff) {
      const lines = patch.diff.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith('+')) {
          linesRemoved++;
        } else if (line.startsWith('-')) {
          linesRestored++;
        }
      }
    }

    const estimatedImpact = linesRestored + linesRemoved > 15 ? 'High' : 
                            linesRestored + linesRemoved > 5 ? 'Medium' : 'Low';

    return {
      affectedFiles: rollback.affectedFiles,
      linesRestored,
      linesRemoved,
      estimatedImpact
    };
  }
}

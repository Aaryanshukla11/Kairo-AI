import { createHash } from 'crypto';
import { CheckpointInfo, CheckpointStatus, CheckpointEventType, CheckpointEventListener } from './checkpointTypes';
import { checkpointBuilder } from './checkpointBuilder';
import { checkpointValidator } from './checkpointValidator';
import { checkpointRegistry } from './checkpointRegistry';
import { CheckpointStorage } from './checkpointStorage';
import { CheckpointEvents } from './checkpointEvents';

export class CheckpointEngine {
  private events = new CheckpointEvents();
  private storage: CheckpointStorage;

  constructor(private workspaceRoot: string) {
    this.storage = new CheckpointStorage(workspaceRoot);
  }

  /**
   * Subscribes to Checkpoint engine events.
   */
  public subscribe(listener: CheckpointEventListener): () => void {
    return this.events.subscribe(listener);
  }

  // --- API ---

  public createCheckpoint(
    workspaceId: string, 
    transactionId: string, 
    affectedFiles: string[], 
    metadata?: Record<string, any>
  ): CheckpointInfo {
    const hash = createHash('md5')
      .update(workspaceId + transactionId + Date.now().toString())
      .digest('hex');

    const checkpoint = checkpointBuilder.build(workspaceId, transactionId, affectedFiles, hash, metadata);
    checkpointValidator.validate(checkpoint, this.workspaceRoot);

    this.storage.saveSnapshot(checkpoint.id, affectedFiles, this.workspaceRoot);

    checkpoint.status = CheckpointStatus.Active;
    checkpointRegistry.register(checkpoint);

    this.events.emit(CheckpointEventType.CheckpointCreated, checkpoint.id, { checkpoint });
    return checkpoint;
  }

  public restoreCheckpoint(id: string): void {
    const cp = checkpointRegistry.getById(id);
    if (!cp) throw new Error(`Checkpoint not found: ${id}`);

    checkpointValidator.validate(cp, this.workspaceRoot);
    checkpointValidator.validateSnapshotIntact(id, this.workspaceRoot);

    cp.status = CheckpointStatus.Restoring;
    this.events.emit(CheckpointEventType.CheckpointLoaded, cp.id);

    try {
      this.storage.restoreSnapshot(id, cp.affectedFiles, this.workspaceRoot);
      cp.status = CheckpointStatus.Restored;
      this.events.emit(CheckpointEventType.CheckpointRestored, cp.id, { checkpoint: cp });
    } catch (err: any) {
      cp.status = CheckpointStatus.Active;
      throw new Error(`Checkpoint restoration failed: ${err.message}`);
    }
  }

  public deleteCheckpoint(id: string): void {
    const cp = checkpointRegistry.getById(id);
    if (!cp) throw new Error(`Checkpoint not found: ${id}`);

    this.storage.deleteSnapshot(id);
    cp.status = CheckpointStatus.Deleted;
    checkpointRegistry.remove(id);
    this.events.emit(CheckpointEventType.CheckpointDeleted, id);
  }

  public expireCheckpoint(id: string): void {
    const cp = checkpointRegistry.getById(id);
    if (!cp) throw new Error(`Checkpoint not found: ${id}`);

    this.storage.deleteSnapshot(id);
    cp.status = CheckpointStatus.Expired;
    this.events.emit(CheckpointEventType.CheckpointExpired, id);
  }

  public getHistory(): CheckpointInfo[] {
    return checkpointRegistry.getAll();
  }
}

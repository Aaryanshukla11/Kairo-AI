import { CheckpointInfo } from './checkpointTypes';

export class CheckpointRegistry {
  private checkpoints = new Map<string, CheckpointInfo>();

  /**
   * Registers a checkpoint, preventing duplicate IDs.
   */
  public register(checkpoint: CheckpointInfo): void {
    if (this.checkpoints.has(checkpoint.id)) {
      throw new Error(`Checkpoint validation error: Duplicate checkpoint detected: "${checkpoint.id}"`);
    }
    this.checkpoints.set(checkpoint.id, checkpoint);
  }

  /**
   * Gets a checkpoint by ID.
   */
  public getById(id: string): CheckpointInfo | undefined {
    return this.checkpoints.get(id);
  }

  /**
   * Returns all checkpoints.
   */
  public getAll(): CheckpointInfo[] {
    return Array.from(this.checkpoints.values());
  }

  public remove(id: string): void {
    this.checkpoints.delete(id);
  }

  public clear(): void {
    this.checkpoints.clear();
  }
}

export const checkpointRegistry = new CheckpointRegistry();

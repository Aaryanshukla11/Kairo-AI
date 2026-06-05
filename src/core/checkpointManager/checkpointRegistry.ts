import { CheckpointModel } from './checkpointTypes';

export class CheckpointRegistry {
  private checkpoints = new Map<string, CheckpointModel>();

  public registerCheckpoint(checkpoint: CheckpointModel): void {
    const key = checkpoint.checkpointId;

    // Immutability Check
    if (this.checkpoints.has(key)) {
      throw new Error(`Versioning Error: Checkpoint ${checkpoint.checkpointId} already exists in the registry and is immutable.`);
    }

    this.checkpoints.set(key, { ...checkpoint });
  }

  public getCheckpoint(checkpointId: string): CheckpointModel | undefined {
    return this.checkpoints.get(checkpointId);
  }

  public listCheckpoints(): CheckpointModel[] {
    return Array.from(this.checkpoints.values());
  }

  public removeCheckpoint(checkpointId: string): void {
    this.checkpoints.delete(checkpointId);
  }

  public clear(): void {
    this.checkpoints.clear();
  }
}

export const checkpointRegistry = new CheckpointRegistry();
export default checkpointRegistry;

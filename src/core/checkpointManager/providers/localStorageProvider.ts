import { CheckpointModel } from '../checkpointTypes';

export class LocalStorageProvider {
  private localRegistry = new Map<string, CheckpointModel>();

  public save(checkpoint: CheckpointModel): void {
    this.localRegistry.set(checkpoint.checkpointId, { ...checkpoint });
  }

  public read(checkpointId: string): CheckpointModel | undefined {
    const data = this.localRegistry.get(checkpointId);
    return data ? { ...data } : undefined;
  }

  public delete(checkpointId: string): void {
    this.localRegistry.delete(checkpointId);
  }

  public list(): CheckpointModel[] {
    return Array.from(this.localRegistry.values());
  }

  public clear(): void {
    this.localRegistry.clear();
  }
}

export const localStorageProvider = new LocalStorageProvider();
export default localStorageProvider;

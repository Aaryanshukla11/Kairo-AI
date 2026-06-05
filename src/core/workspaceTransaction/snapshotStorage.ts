import { WorkspaceSnapshot } from './transactionTypes';

export class SnapshotStorage {
  private storage = new Map<string, WorkspaceSnapshot>();

  public save(snapshot: WorkspaceSnapshot): void {
    this.storage.set(snapshot.snapshotId, snapshot);
  }

  public get(snapshotId: string): WorkspaceSnapshot | undefined {
    return this.storage.get(snapshotId);
  }

  public delete(snapshotId: string): boolean {
    return this.storage.delete(snapshotId);
  }

  public clear(): void {
    this.storage.clear();
  }
}
export const snapshotStorage = new SnapshotStorage();

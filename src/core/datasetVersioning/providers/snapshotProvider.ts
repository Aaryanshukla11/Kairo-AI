import { DatasetSnapshotModel } from '../versionTypes';

export class SnapshotProvider {
  private snapshots = new Map<string, DatasetSnapshotModel>();

  public saveSnapshot(snapshot: DatasetSnapshotModel): void {
    this.snapshots.set(snapshot.snapshotId, snapshot);
  }

  public getSnapshot(snapshotId: string): DatasetSnapshotModel | undefined {
    return this.snapshots.get(snapshotId);
  }

  public clear(): void {
    this.snapshots.clear();
  }
}

export const snapshotProvider = new SnapshotProvider();
export default snapshotProvider;

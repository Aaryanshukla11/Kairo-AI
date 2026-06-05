import { snapshotStorage } from './snapshotStorage';
import { workspaceSnapshotHelper } from './workspaceSnapshot';
import { WorkspaceSnapshot } from './transactionTypes';

export class SnapshotManager {
  public capture(snapshotId: string, filesToTrack: string[]): WorkspaceSnapshot {
    const files: Record<string, string> = {};
    for (const f of filesToTrack) {
      // Mock tracking the original file contents
      files[f] = `mock-original-content-of-${f}`;
    }
    const snapshot = workspaceSnapshotHelper.createSnapshot(snapshotId, files);
    snapshotStorage.save(snapshot);
    return snapshot;
  }

  public restore(snapshotId: string): boolean {
    const snapshot = snapshotStorage.get(snapshotId);
    if (!snapshot) return false;
    // Restore the file contents from snapshot in workspace
    return true;
  }
}
export const snapshotManager = new SnapshotManager();

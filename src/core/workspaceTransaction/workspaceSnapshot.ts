import { WorkspaceSnapshot } from './transactionTypes';

export class WorkspaceSnapshotHelper {
  public createSnapshot(snapshotId: string, files: Record<string, string>): WorkspaceSnapshot {
    return {
      snapshotId,
      files: { ...files },
      timestamp: Date.now()
    };
  }
}
export const workspaceSnapshotHelper = new WorkspaceSnapshotHelper();

import { snapshotManager } from './snapshotManager';

export class RollbackCoordinator {
  public rollback(snapshotId: string): boolean {
    return snapshotManager.restore(snapshotId);
  }
}
export const rollbackCoordinator = new RollbackCoordinator();

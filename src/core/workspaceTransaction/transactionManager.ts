import { TransactionReport, TransactionState } from './transactionTypes';
import { snapshotManager } from './snapshotManager';
import { rollbackCoordinator } from './rollbackCoordinator';
import { transactionMetrics } from './transactionMetrics';
import { transactionEvents } from './transactionEvents';

export class TransactionManager {
  private activeTransactions = new Map<string, { openedAt: number; files: string[]; snapshotId: string; state: TransactionState }>();

  public beginTransaction(transactionId: string, filesToTrack: string[]): string {
    const snapshotId = `snap-${transactionId}`;
    snapshotManager.capture(snapshotId, filesToTrack);

    this.activeTransactions.set(transactionId, {
      openedAt: Date.now(),
      files: filesToTrack,
      snapshotId,
      state: 'Active'
    });

    transactionMetrics.recordOpen();
    transactionEvents.emit('TransactionOpened', { transactionId, snapshotId });

    return snapshotId;
  }

  public commitTransaction(transactionId: string): TransactionReport {
    const tx = this.activeTransactions.get(transactionId);
    if (!tx) throw new Error(`Transaction ${transactionId} not found`);

    tx.state = 'Committed';
    transactionMetrics.recordCommit();
    transactionEvents.emit('TransactionCommitted', { transactionId });

    return {
      transactionId,
      state: 'Committed',
      openedAt: tx.openedAt,
      closedAt: Date.now(),
      operationsCount: tx.files.length,
      durationMs: Date.now() - tx.openedAt
    };
  }

  public rollbackTransaction(transactionId: string): TransactionReport {
    const tx = this.activeTransactions.get(transactionId);
    if (!tx) throw new Error(`Transaction ${transactionId} not found`);

    rollbackCoordinator.rollback(tx.snapshotId);
    tx.state = 'Aborted';

    transactionMetrics.recordRollback();
    transactionEvents.emit('TransactionAborted', { transactionId });

    return {
      transactionId,
      state: 'Aborted',
      openedAt: tx.openedAt,
      closedAt: Date.now(),
      operationsCount: tx.files.length,
      durationMs: Date.now() - tx.openedAt
    };
  }
}
export const transactionManager = new TransactionManager();

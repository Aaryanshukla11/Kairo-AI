import { transactionManager } from './transactionManager';
import { TransactionReport } from './transactionTypes';

export class TransactionEngine {
  public async executeTransactional<T>(
    transactionId: string,
    filesToTrack: string[],
    action: () => Promise<T>
  ): Promise<{ report: TransactionReport; result: T }> {
    transactionManager.beginTransaction(transactionId, filesToTrack);
    try {
      const result = await action();
      const report = transactionManager.commitTransaction(transactionId);
      return { report, result };
    } catch (err) {
      const report = transactionManager.rollbackTransaction(transactionId);
      throw err;
    }
  }
}
export const transactionEngine = new TransactionEngine();

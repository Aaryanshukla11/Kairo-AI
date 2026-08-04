import { SynchronizationReportModel } from './distributedTypes';
import { workerManager } from './workerManager';

export class SynchronizationManager {
  public executeBarrierSync(): SynchronizationReportModel {
    const syncId = `SYNC-${Date.now()}`;
    const workers = workerManager.listWorkers();
    
    const mismatchedWorkers: string[] = [];

    // Ensure all workers are either in 'Synchronizing', 'Waiting', or 'Training'
    workers.forEach(w => {
      if (w.state === 'Failed' || w.state === 'Disconnected') {
        mismatchedWorkers.push(w.workerId);
      }
    });

    const success = mismatchedWorkers.length === 0;

    return {
      syncId,
      timestamp: Date.now(),
      barrierDurationMs: success ? Math.round(15 + Math.random() * 30) : 0,
      success,
      mismatchedWorkers
    };
  }
}

export const synchronizationManager = new SynchronizationManager();
export default synchronizationManager;

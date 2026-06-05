import { workerManager } from './workerManager';

export class DistributedScheduler {
  public splitTasks(
    globalBatchSize: number,
    globalStep: number
  ): { perWorkerBatchSize: number; workerSteps: Record<string, number> } {
    const workers = workerManager.listWorkers();
    const count = Math.max(1, workers.length);

    const perWorkerBatchSize = Math.max(1, Math.floor(globalBatchSize / count));
    const workerSteps: Record<string, number> = {};

    workers.forEach(w => {
      workerSteps[w.workerId] = globalStep;
    });

    return {
      perWorkerBatchSize,
      workerSteps
    };
  }
}

export const distributedScheduler = new DistributedScheduler();
export default distributedScheduler;

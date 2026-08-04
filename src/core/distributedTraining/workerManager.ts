import { WorkerModel, WorkerState } from './distributedTypes';

export class WorkerManager {
  private workers = new Map<string, WorkerModel>();

  public registerWorker(worker: WorkerModel): void {
    this.workers.set(worker.workerId, { ...worker });
  }

  public getWorker(workerId: string): WorkerModel | undefined {
    return this.workers.get(workerId);
  }

  public listWorkers(): WorkerModel[] {
    return Array.from(this.workers.values());
  }

  public updateWorkerState(workerId: string, state: WorkerState): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.state = state;
      worker.lastHeartbeat = Date.now();
      this.workers.set(workerId, worker);
    }
  }

  public logTelemetry(workerId: string, gpu: number, vram: number, throughput: number): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.gpuUsagePercent = gpu;
      worker.vramUsageMB = vram;
      worker.throughputTokensPerSec = throughput;
      worker.lastHeartbeat = Date.now();
      this.workers.set(workerId, worker);
    }
  }

  public markWorkerFailed(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.state = 'Failed';
      worker.isHealthy = false;
      this.workers.set(workerId, worker);
    }
  }

  public clear(): void {
    this.workers.clear();
  }
}

export const workerManager = new WorkerManager();
export default workerManager;

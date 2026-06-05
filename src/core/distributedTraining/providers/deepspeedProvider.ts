import { WorkerModel } from '../distributedTypes';

export class DeepspeedProvider {
  public executeZeroStageOffload(workers: WorkerModel[]): void {
    // Simulate DeepSpeed ZeRO-3 parameters partitioning and CPU offloads
    workers.forEach(w => {
      w.vramUsageMB = Math.round(w.vramUsageMB * 0.4); // reduce VRAM usage footprint by partition
    });
  }
}

export const deepspeedProvider = new DeepspeedProvider();
export default deepspeedProvider;

import { WorkerModel } from '../distributedTypes';

export class PytorchDistributedProvider {
  public executeAllReduce(workers: WorkerModel[]): void {
    // Simulate PyTorch DDP AllReduce parameter updates synchronizations
    workers.forEach(w => {
      if (w.state === 'Training') {
        w.state = 'Synchronizing';
      }
    });
  }
}

export const pytorchDistributedProvider = new PytorchDistributedProvider();
export default pytorchDistributedProvider;

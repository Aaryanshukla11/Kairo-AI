import { WorkerModel } from '../distributedTypes';

export class HorovodProvider {
  public executeRingAllReduce(workers: WorkerModel[]): void {
    // Simulate Horovod Ring-AllReduce parameter gradients exchanges
    workers.forEach(w => {
      if (w.state === 'Synchronizing') {
        w.state = 'Idle';
      }
    });
  }
}

export const horovodProvider = new HorovodProvider();
export default horovodProvider;

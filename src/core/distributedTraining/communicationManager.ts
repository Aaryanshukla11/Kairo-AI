import { workerManager } from './workerManager';
import { pytorchDistributedProvider, deepspeedProvider, horovodProvider } from './providers';

export class CommunicationManager {
  public syncGradients(strategy: 'pytorch' | 'deepspeed' | 'horovod' | string): void {
    const workers = workerManager.listWorkers();
    
    if (strategy === 'pytorch') {
      pytorchDistributedProvider.executeAllReduce(workers);
    } else if (strategy === 'deepspeed') {
      deepspeedProvider.executeZeroStageOffload(workers);
    } else if (strategy === 'horovod') {
      horovodProvider.executeRingAllReduce(workers);
    }

    // Sync values back to workerManager database registry
    workers.forEach(w => {
      workerManager.updateWorkerState(w.workerId, w.state);
      workerManager.logTelemetry(w.workerId, w.gpuUsagePercent, w.vramUsageMB, w.throughputTokensPerSec);
    });
  }
}

export const communicationManager = new CommunicationManager();
export default communicationManager;

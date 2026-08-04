import { workerManager } from './workerManager';
import { nodeManager } from './nodeManager';
import { ClusterReportModel } from './distributedTypes';

export class DistributedMetrics {
  public aggregateMetrics(clusterId: string): ClusterReportModel {
    const workers = workerManager.listWorkers();
    const nodes = nodeManager.listNodes();

    let totalThroughput = 0;
    let totalVram = 0;
    let failedCount = 0;
    let activeCount = 0;

    workers.forEach(w => {
      totalThroughput += w.throughputTokensPerSec;
      totalVram += w.vramUsageMB;
      if (w.state === 'Failed' || w.state === 'Disconnected') {
        failedCount++;
      } else {
        activeCount++;
      }
    });

    const averageThroughput = workers.length > 0 ? totalThroughput / workers.length : 0;
    const healthyNodesCount = nodes.filter(n => n.status === 'online').length;

    return {
      clusterId,
      totalWorkers: workers.length,
      activeWorkers: activeCount,
      failedWorkers: failedCount,
      averageThroughput,
      totalGpuMemoryUsedMB: totalVram,
      healthyNodesCount
    };
  }
}

export const distributedMetrics = new DistributedMetrics();
export default distributedMetrics;

import { WorkerModel, NodeModel } from '../distributedTypes';

export class MockClusterProvider {
  public generateMockCluster(): { workers: WorkerModel[]; nodes: NodeModel[] } {
    const nodes: NodeModel[] = [
      { nodeId: 'node-0', ipAddress: '192.168.1.10', ramUsagePercent: 45, cpuUsagePercent: 55, workersCount: 4, status: 'online' },
      { nodeId: 'node-1', ipAddress: '192.168.1.11', ramUsagePercent: 42, cpuUsagePercent: 51, workersCount: 4, status: 'online' }
    ];

    const workers: WorkerModel[] = [];
    nodes.forEach(n => {
      for (let i = 0; i < n.workersCount; i++) {
        workers.push({
          workerId: `worker-${n.nodeId}-gpu-${i}`,
          nodeId: n.nodeId,
          gpuId: i,
          state: 'Idle',
          gpuUsagePercent: 0,
          vramUsageMB: 16384, // 16GB VRAM mock limit
          throughputTokensPerSec: 0,
          isHealthy: true,
          lastHeartbeat: Date.now()
        });
      }
    });

    return { workers, nodes };
  }
}

export const mockClusterProvider = new MockClusterProvider();
export default mockClusterProvider;

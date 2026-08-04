import { DistributedMode } from './distributedTypes';
import { nodeManager } from './nodeManager';
import { workerManager } from './workerManager';

export class TopologyManager {
  public validateTopology(mode: DistributedMode): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodes = nodeManager.listNodes();
    const workers = workerManager.listWorkers();

    if (mode === 'Multi Node' && nodes.length < 2) {
      errors.push('Topology Error: Multi-node modes require at least 2 nodes registered.');
    }

    if (mode === 'Multi GPU' && workers.length < 2) {
      errors.push('Topology Error: Multi-GPU mode requires at least 2 workers registered.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const topologyManager = new TopologyManager();
export default topologyManager;

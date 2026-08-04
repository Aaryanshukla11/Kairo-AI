import { nodeManager } from './nodeManager';
import { workerManager } from './workerManager';

export class DistributedValidator {
  public validateClusterConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodes = nodeManager.listNodes();
    const workers = workerManager.listWorkers();

    if (nodes.length === 0) {
      errors.push('Validation Error: No compute nodes are registered in the topology.');
    }

    nodes.forEach(n => {
      if (n.status !== 'online') {
        errors.push(`Validation Error: Node ${n.nodeId} is offline or unreachable.`);
      }
    });

    workers.forEach(w => {
      if (!w.isHealthy) {
        errors.push(`Validation Error: Worker ${w.workerId} is unhealthy or disconnected.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const distributedValidator = new DistributedValidator();
export default distributedValidator;

import { DistributedSessionModel, DistributedMode } from './distributedTypes';
import { nodeManager } from './nodeManager';
import { workerManager } from './workerManager';

export class ClusterManager {
  private activeSession?: DistributedSessionModel;

  public initializeCluster(
    mode: DistributedMode,
    config: any
  ): DistributedSessionModel {
    const clusterId = `CLUSTER-${mode.replace(/\s+/g, '-')}-${Date.now()}`;
    const sessionId = `DIST-SESS-${Date.now()}`;

    // Get nodes and workers from nodeManager and workerManager
    const nodes = nodeManager.listNodes();
    const workers = workerManager.listWorkers();

    this.activeSession = {
      sessionId,
      mode,
      clusterId,
      workers,
      nodes,
      createdAt: Date.now(),
      status: 'active'
    };

    return this.activeSession;
  }

  public getSession(): DistributedSessionModel | undefined {
    return this.activeSession;
  }

  public updateSessionStatus(status: 'active' | 'completed' | 'failed' | 'paused'): void {
    if (this.activeSession) {
      this.activeSession.status = status;
    }
  }

  public clear(): void {
    this.activeSession = undefined;
  }
}

export const clusterManager = new ClusterManager();
export default clusterManager;

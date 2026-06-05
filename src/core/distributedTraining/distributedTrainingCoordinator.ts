import {
  DistributedSessionModel,
  ClusterReportModel,
  SynchronizationReportModel,
  DistributedMode,
  DistributedEventListener
} from './distributedTypes';
import { coordinatorEngine } from './coordinatorEngine';
import { clusterManager } from './clusterManager';
import { nodeManager } from './nodeManager';
import { workerManager } from './workerManager';
import { distributedHistory } from './distributedHistory';
import { distributedMetrics } from './distributedMetrics';
import { distributedEvents } from './distributedEvents';

export class DistributedTrainingCoordinator {
  public async executeDistributedSession(
    mode: DistributedMode,
    config: any
  ): Promise<{
    session: DistributedSessionModel;
    syncReport: SynchronizationReportModel;
    clusterReport: ClusterReportModel;
  }> {
    return coordinatorEngine.executePipeline(mode, config);
  }

  public getSessionDetails(): DistributedSessionModel | undefined {
    return clusterManager.getSession();
  }

  public getHistoryLogs() {
    return distributedHistory.getHistory();
  }

  public getMetricsSummary(clusterId: string): ClusterReportModel {
    return distributedMetrics.aggregateMetrics(clusterId);
  }

  public subscribe(listener: DistributedEventListener): () => void {
    return distributedEvents.subscribe(listener);
  }

  public clearHistory(): void {
    clusterManager.clear();
    nodeManager.clear();
    workerManager.clear();
    distributedHistory.clear();
    distributedEvents.clear();
  }
}

export const distributedTrainingCoordinator = new DistributedTrainingCoordinator();
export default distributedTrainingCoordinator;

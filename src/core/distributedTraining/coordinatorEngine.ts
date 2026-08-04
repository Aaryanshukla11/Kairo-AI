import {
  DistributedSessionModel,
  ClusterReportModel,
  SynchronizationReportModel,
  DistributedEventType,
  DistributedMode
} from './distributedTypes';
import { nodeManager } from './nodeManager';
import { workerManager } from './workerManager';
import { clusterManager } from './clusterManager';
import { topologyManager } from './topologyManager';
import { distributedScheduler } from './distributedScheduler';
import { distributedValidator } from './distributedValidator';
import { synchronizationManager } from './synchronizationManager';
import { communicationManager } from './communicationManager';
import { distributedMetrics } from './distributedMetrics';
import { distributedEvents } from './distributedEvents';
import { distributedHistory } from './distributedHistory';
import { mockClusterProvider } from './providers';

export class CoordinatorEngine {
  public async executePipeline(
    mode: DistributedMode,
    config: any
  ): Promise<{
    session: DistributedSessionModel;
    syncReport: SynchronizationReportModel;
    clusterReport: ClusterReportModel;
  }> {
    
    // 1. Ingest nodes and workers mocks
    nodeManager.clear();
    workerManager.clear();

    const mockCluster = mockClusterProvider.generateMockCluster();
    mockCluster.nodes.forEach(n => nodeManager.registerNode(n));
    mockCluster.workers.forEach(w => workerManager.registerWorker(w));

    // 2. Validate topologies
    const topo = topologyManager.validateTopology(mode);
    if (!topo.isValid) {
      throw new Error(`Distributed Topology Validation Error: ${topo.errors.join(', ')}`);
    }

    // 3. Create Cluster
    const session = clusterManager.initializeCluster(mode, config);
    distributedEvents.emit(DistributedEventType.ClusterCreated, { clusterId: session.clusterId });

    // 4. Register Workers
    session.workers.forEach(w => {
      workerManager.updateWorkerState(w.workerId, 'Preparing');
    });
    distributedEvents.emit(DistributedEventType.WorkersRegistered);

    // 5. Validate online status
    const val = distributedValidator.validateClusterConfig(config);
    if (!val.isValid) {
      throw new Error(`Distributed Cluster Config Error: ${val.errors.join(', ')}`);
    }

    // 6. Assign Tasks
    const schedulerInfo = distributedScheduler.splitTasks(config.globalBatchSize || 256, config.globalStep || 100);
    distributedEvents.emit(DistributedEventType.TasksAssigned, { schedulerInfo });

    // 7. Synchronize State
    session.workers.forEach(w => {
      workerManager.updateWorkerState(w.workerId, 'Synchronizing');
    });
    const syncReport = synchronizationManager.executeBarrierSync();
    distributedEvents.emit(DistributedEventType.StateSynchronized, { syncReport });

    // 8. Execute Training & sync gradients
    session.workers.forEach(w => {
      workerManager.updateWorkerState(w.workerId, 'Training');
      // mock training workloads
      workerManager.logTelemetry(w.workerId, 92, 12000, 4200);
    });
    distributedEvents.emit(DistributedEventType.TrainingExecuted);

    communicationManager.syncGradients(config.strategy || 'pytorch');

    // 9. Monitor Health
    distributedEvents.emit(DistributedEventType.HealthMonitored);

    // 10. Aggregate Metrics
    const clusterReport = distributedMetrics.aggregateMetrics(session.clusterId);
    distributedEvents.emit(DistributedEventType.MetricsAggregated, { clusterReport });

    // 11. Update Checkpoints
    distributedEvents.emit(DistributedEventType.CheckpointsUpdated);

    distributedHistory.logAction(session.clusterId, `Distributed session executed in mode ${mode}.`);

    return {
      session,
      syncReport,
      clusterReport
    };
  }
}

export const coordinatorEngine = new CoordinatorEngine();
export default coordinatorEngine;

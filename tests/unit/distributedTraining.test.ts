import * as assert from 'assert';
import { distributedTrainingCoordinator } from '../../src/core/distributedTraining/distributedTrainingCoordinator';
import { nodeManager } from '../../src/core/distributedTraining/nodeManager';
import { workerManager } from '../../src/core/distributedTraining/workerManager';
import { synchronizationManager } from '../../src/core/distributedTraining/synchronizationManager';
import { communicationManager } from '../../src/core/distributedTraining/communicationManager';
import { topologyManager } from '../../src/core/distributedTraining/topologyManager';
import { distributedScheduler } from '../../src/core/distributedTraining/distributedScheduler';
import { distributedValidator } from '../../src/core/distributedTraining/distributedValidator';
import { distributedMetrics } from '../../src/core/distributedTraining/distributedMetrics';

describe('Distributed Training Coordinator Unit Tests', () => {
  beforeEach(() => {
    distributedTrainingCoordinator.clearHistory();
  });

  describe('Mock Cluster Node & Worker registries', () => {
    it('should register nodes and workers and log telemetry status updates', () => {
      nodeManager.registerNode({ nodeId: 'n-0', ipAddress: '127.0.0.1', ramUsagePercent: 10, cpuUsagePercent: 12, workersCount: 1, status: 'online' });
      workerManager.registerWorker({ workerId: 'w-0', nodeId: 'n-0', gpuId: 0, state: 'Idle', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });

      const node = nodeManager.getNode('n-0');
      assert.ok(node);
      assert.strictEqual(node.status, 'online');

      workerManager.updateWorkerState('w-0', 'Training');
      const worker = workerManager.getWorker('w-0');
      assert.ok(worker);
      assert.strictEqual(worker.state, 'Training');
    });

    it('should transition workers to Offline and Failed status', () => {
      workerManager.registerWorker({ workerId: 'w-1', nodeId: 'n-0', gpuId: 1, state: 'Idle', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });
      workerManager.markWorkerFailed('w-1');
      
      const worker = workerManager.getWorker('w-1');
      assert.ok(worker);
      assert.strictEqual(worker.state, 'Failed');
      assert.strictEqual(worker.isHealthy, false);
    });
  });

  describe('Synchronization barriers & Communications strategy adapters', () => {
    it('should fail barrier synchronizations if any worker node is failed', () => {
      workerManager.registerWorker({ workerId: 'w-good', nodeId: 'n-0', gpuId: 0, state: 'Training', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });
      workerManager.registerWorker({ workerId: 'w-bad', nodeId: 'n-0', gpuId: 1, state: 'Failed', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: false, lastHeartbeat: Date.now() });

      const sync = synchronizationManager.executeBarrierSync();
      assert.strictEqual(sync.success, false);
      assert.deepStrictEqual(sync.mismatchedWorkers, ['w-bad']);
    });

    it('should compress VRAM memory footprints using DeepSpeed ZeRO partitioning offloads', () => {
      workerManager.registerWorker({ workerId: 'w-ds', nodeId: 'n-0', gpuId: 0, state: 'Training', gpuUsagePercent: 0, vramUsageMB: 16000, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });
      communicationManager.syncGradients('deepspeed');

      const worker = workerManager.getWorker('w-ds');
      assert.ok(worker);
      assert.strictEqual(worker.vramUsageMB, 6400); // 16000 * 0.4 ZeRO partition
    });
  });

  describe('Topology Validators & Task schedulers splits', () => {
    it('should fail topology audits if Multi-Node requires more nodes', () => {
      nodeManager.registerNode({ nodeId: 'n-0', ipAddress: '127.0.0.1', ramUsagePercent: 10, cpuUsagePercent: 12, workersCount: 1, status: 'online' });
      const val = topologyManager.validateTopology('Multi Node');
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors[0].includes('require at least 2 nodes'));
    });

    it('should split tasks per worker count step sizes', () => {
      workerManager.registerWorker({ workerId: 'w-1', nodeId: 'n-0', gpuId: 0, state: 'Idle', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });
      workerManager.registerWorker({ workerId: 'w-2', nodeId: 'n-0', gpuId: 1, state: 'Idle', gpuUsagePercent: 0, vramUsageMB: 1024, throughputTokensPerSec: 0, isHealthy: true, lastHeartbeat: Date.now() });

      const split = distributedScheduler.splitTasks(256, 100);
      assert.strictEqual(split.perWorkerBatchSize, 128); // 256 / 2 workers
      assert.strictEqual(split.workerSteps['w-1'], 100);
    });
  });

  describe('Distributed Training Pipeline E2E Coordinator Run', () => {
    it('should run complete pipelines pipeline, log events, and compile cluster report metrics', async () => {
      const events: string[] = [];
      const unsubscribe = distributedTrainingCoordinator.subscribe(e => {
        events.push(e.type);
      });

      const res = await distributedTrainingCoordinator.executeDistributedSession(
        'Multi Node',
        { globalBatchSize: 512, globalStep: 200, strategy: 'pytorch' }
      );

      assert.strictEqual(res.session.status, 'active');
      assert.strictEqual(res.syncReport.success, true);
      assert.strictEqual(res.clusterReport.totalWorkers, 8); // 4 workers * 2 nodes
      assert.strictEqual(res.clusterReport.healthyNodesCount, 2);

      // Events checks
      assert.ok(events.includes('ClusterCreated'));
      assert.ok(events.includes('WorkersRegistered'));
      assert.ok(events.includes('TasksAssigned'));
      assert.ok(events.includes('StateSynchronized'));
      assert.ok(events.includes('TrainingExecuted'));
      assert.ok(events.includes('MetricsAggregated'));

      unsubscribe();
    });
  });
});

import * as assert from 'assert';
import { workflowCoordinator } from '../../src/core/workflowCoordinator/workflowCoordinator';
import { workflowLifecycleManager } from '../../src/core/workflowCoordinator/workflowLifecycle';
import { workflowQueueManager } from '../../src/core/workflowCoordinator/workflowQueue';
import { workflowPolicyManager } from '../../src/core/workflowCoordinator/workflowPolicyManager';
import { workflowValidator } from '../../src/core/workflowCoordinator/workflowValidator';
import { WorkflowState, WorkflowStrategyType, QueueType, WorkflowGraph, WorkflowStage } from '../../src/core/workflowCoordinator/workflowTypes';

describe('Autonomous Workflow Coordinator Foundation Tests', () => {
  it('should coordinate a complete workflow and produce a report', async () => {
    const report = await workflowCoordinator.coordinate({
      strategy: WorkflowStrategyType.Parallel,
      queueType: QueueType.FIFO
    });

    assert.ok(report.reportId.startsWith('WFR-'));
    assert.strictEqual(report.validationResult.valid, true);
    assert.ok(report.graph.stages.length > 0);
    assert.ok(report.context.sessionToken);
    assert.ok(report.policyRules.length > 0);
    assert.ok(report.executionConfidence >= 0.5);
    assert.ok(report.metrics.totalWorkflows > 0);
  });

  it('should enforce lifecycle state transitions', () => {
    assert.strictEqual(workflowLifecycleManager.canTransition(WorkflowState.Created, WorkflowState.Queued), true);
    assert.strictEqual(workflowLifecycleManager.canTransition(WorkflowState.Queued, WorkflowState.Scheduled), true);
    assert.strictEqual(workflowLifecycleManager.canTransition(WorkflowState.Scheduled, WorkflowState.Running), true);
    assert.strictEqual(workflowLifecycleManager.canTransition(WorkflowState.Running, WorkflowState.Completed), true);

    // Invalid transition
    assert.strictEqual(workflowLifecycleManager.canTransition(WorkflowState.Created, WorkflowState.Completed), false);
    assert.throws(() => {
      workflowLifecycleManager.transition('WF-01', WorkflowState.Created, WorkflowState.Completed);
    }, /Invalid workflow transition/);
  });

  it('should manage queue operations with FIFO and Priority', () => {
    workflowQueueManager.clear();
    workflowQueueManager.enqueue('WF-A', QueueType.FIFO);
    workflowQueueManager.enqueue('WF-B', QueueType.FIFO);
    assert.deepStrictEqual(workflowQueueManager.getQueue(), ['WF-A', 'WF-B']);

    workflowQueueManager.enqueue('WF-URGENT', QueueType.Priority);
    assert.deepStrictEqual(workflowQueueManager.getQueue(), ['WF-URGENT', 'WF-A', 'WF-B']);
    workflowQueueManager.clear();
  });

  it('should evaluate execution policy rules', () => {
    const evalRes = workflowPolicyManager.evaluatePolicies();
    assert.strictEqual(evalRes.valid, true);
    assert.ok(evalRes.rules.length >= 5);
    assert.ok(evalRes.rules.some(r => r.type === 'ExecutionLimit'));
    assert.ok(evalRes.rules.some(r => r.type === 'RollbackEligibility'));
  });

  it('should detect deadlock / circular workflow dependencies', () => {
    const cyclicGraph: WorkflowGraph = {
      id: 'WF-CYCLE',
      name: 'Cycle Graph',
      strategy: WorkflowStrategyType.Sequential,
      stages: [
        { id: 'S1', name: 'Stage 1', engine: 'Engine1', status: WorkflowState.Created, dependencies: ['S2'], retryCount: 0, maxRetries: 3, estimatedRuntimeMs: 1000, confidence: 0.9 },
        { id: 'S2', name: 'Stage 2', engine: 'Engine2', status: WorkflowState.Created, dependencies: ['S1'], retryCount: 0, maxRetries: 3, estimatedRuntimeMs: 1000, confidence: 0.9 }
      ],
      executionOrder: ['S1', 'S2'],
      parallelGroups: [['S1'], ['S2']],
      criticalPath: ['S1', 'S2']
    };

    const validation = workflowValidator.validate(cyclicGraph);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('circular workflow dependency detected')));
  });
});

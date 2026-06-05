import * as assert from 'assert';
import { milestoneOrchestrationEngine } from '../../src/core/milestoneOrchestration/milestoneOrchestrationEngine';
import { milestoneStateMachine } from '../../src/core/milestoneOrchestration/milestoneStateMachine';
import { milestoneDependencyResolver } from '../../src/core/milestoneOrchestration/milestoneDependencyResolver';
import { milestoneValidator } from '../../src/core/milestoneOrchestration/milestoneValidator';
import { milestoneCoordinator } from '../../src/core/milestoneOrchestration/milestoneCoordinator';
import { MilestoneState, MilestoneStrategyType, MilestoneNode } from '../../src/core/milestoneOrchestration/milestoneTypes';

describe('Milestone Orchestration Engine Foundation Tests', () => {
  it('should successfully orchestrate milestones and produce a report', async () => {
    const report = await milestoneOrchestrationEngine.orchestrate({
      strategy: MilestoneStrategyType.Hybrid
    });

    assert.ok(report.reportId.startsWith('MOR-'));
    assert.strictEqual(report.validationResult.valid, true);
    assert.ok(report.workflow.milestones.length > 0);
    assert.ok(report.checkpoints.length > 0);
    assert.ok(report.recoveryPlans.length > 0);
    assert.ok(report.executionConfidence > 0.8);
    assert.ok(report.metrics.totalMilestones > 0);
  });

  it('should enforce state machine transitions', () => {
    // Valid transitions
    assert.strictEqual(milestoneStateMachine.canTransition(MilestoneState.Created, MilestoneState.Planned), true);
    assert.strictEqual(milestoneStateMachine.canTransition(MilestoneState.Planned, MilestoneState.Running), true);
    assert.strictEqual(milestoneStateMachine.canTransition(MilestoneState.Running, MilestoneState.Completed), true);

    // Invalid transition
    assert.strictEqual(milestoneStateMachine.canTransition(MilestoneState.Created, MilestoneState.Completed), false);

    assert.throws(() => {
      milestoneStateMachine.transition('M01', MilestoneState.Created, MilestoneState.Completed);
    }, /Invalid milestone state transition/);
  });

  it('should detect circular milestone dependencies', () => {
    const cyclicMilestones: MilestoneNode[] = [
      {
        id: 'M01',
        title: 'M1',
        description: '',
        status: MilestoneState.Planned,
        priority: 1,
        dependencies: ['M02'],
        tasks: ['T01'],
        parallelGroups: [['T01']],
        checkpoints: ['CP01'],
        estimatedRuntime: 1000,
        estimatedTokens: 500,
        confidence: 0.9
      },
      {
        id: 'M02',
        title: 'M2',
        description: '',
        status: MilestoneState.Planned,
        priority: 2,
        dependencies: ['M01'],
        tasks: ['T02'],
        parallelGroups: [['T02']],
        checkpoints: ['CP02'],
        estimatedRuntime: 1000,
        estimatedTokens: 500,
        confidence: 0.9
      }
    ];

    const cycleReport = milestoneDependencyResolver.detectCycles(cyclicMilestones);
    assert.strictEqual(cycleReport.hasCycles, true);
    assert.strictEqual(cycleReport.cycles.length, 1);

    assert.throws(() => {
      milestoneDependencyResolver.resolveExecutionOrder(cyclicMilestones);
    }, /Circular milestone dependencies detected/);
  });

  it('should calculate topological order for valid milestone chains', () => {
    const milestones: MilestoneNode[] = [
      { id: 'M01', title: 'M1', description: '', status: MilestoneState.Planned, priority: 1, dependencies: [], tasks: ['T1'], parallelGroups: [['T1']], checkpoints: ['CP1'], estimatedRuntime: 1000, estimatedTokens: 500, confidence: 0.9 },
      { id: 'M02', title: 'M2', description: '', status: MilestoneState.Planned, priority: 2, dependencies: ['M01'], tasks: ['T2'], parallelGroups: [['T2']], checkpoints: ['CP2'], estimatedRuntime: 1000, estimatedTokens: 500, confidence: 0.9 },
      { id: 'M03', title: 'M3', description: '', status: MilestoneState.Planned, priority: 3, dependencies: ['M02'], tasks: ['T3'], parallelGroups: [['T3']], checkpoints: ['CP3'], estimatedRuntime: 1000, estimatedTokens: 500, confidence: 0.9 }
    ];

    const order = milestoneDependencyResolver.resolveExecutionOrder(milestones);
    assert.deepStrictEqual(order, ['M01', 'M02', 'M03']);
  });

  it('should validate complete task coverage and checkpoints', () => {
    const milestones: MilestoneNode[] = [
      { id: 'M01', title: 'M1', description: '', status: MilestoneState.Planned, priority: 1, dependencies: [], tasks: [], parallelGroups: [], checkpoints: [], estimatedRuntime: 1000, estimatedTokens: 500, confidence: 0.9 }
    ];

    const validation = milestoneValidator.validate(milestones, ['M01'], [], []);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('missing a valid checkpoint')));
    assert.ok(validation.errors.some(e => e.includes('missing a rollback/recovery plan')));
    assert.ok(validation.warnings.some(w => w.includes('has no tasks assigned')));
  });

  it('should apply execution strategies', () => {
    const milestones: MilestoneNode[] = [
      { id: 'M01', title: 'M1', description: '', status: MilestoneState.Planned, priority: 1, dependencies: [], tasks: ['T1'], parallelGroups: [['T1']], checkpoints: ['CP1'], estimatedRuntime: 1000, estimatedTokens: 500, confidence: 0.9 }
    ];
    const order = ['M01'];

    const seqWorkflow = milestoneCoordinator.coordinate(milestones, order, MilestoneStrategyType.Sequential);
    assert.strictEqual(seqWorkflow.strategy, MilestoneStrategyType.Sequential);

    const parWorkflow = milestoneCoordinator.coordinate(milestones, order, MilestoneStrategyType.Parallel);
    assert.strictEqual(parWorkflow.strategy, MilestoneStrategyType.Parallel);
  });
});

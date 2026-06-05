import * as assert from 'assert';
import { executionPlanningEngine } from '../../src/core/executionPlanning/executionPlanningEngine';
import { executionPlanner } from '../../src/core/executionPlanning/executionPlanner';
import { executionValidator } from '../../src/core/executionPlanning/executionValidator';
import { executionMetrics } from '../../src/core/executionPlanning/executionMetrics';
import { TaskGraph } from '../../src/core/taskGeneration/taskTypes';

describe('Execution Planning Engine Foundation (M04-S01-T003) Tests', () => {
  const sampleTaskGraph: TaskGraph = {
    nodes: {
      'T1': {
        task: {
          taskId: 'T1',
          title: 'Database Schema Setup',
          description: 'Create user and auth tables',
          taskType: 'Database Task',
          parentMilestone: 'M1',
          dependencies: [],
          requiredSymbols: ['UserSchema'],
          requiredFiles: ['src/db/userSchema.ts'],
          expectedOutput: 'Table schemas created',
          estimatedTimeMs: 120000,
          estimatedTokens: 1000,
          risk: 'High',
          priority: 'Critical',
          confidence: 0.9,
          executionStrategy: 'Manual Approval'
        },
        children: ['T2', 'T3'],
        parents: [],
        depth: 0,
        inCriticalPath: true
      },
      'T2': {
        task: {
          taskId: 'T2',
          title: 'REST API Endpoints',
          description: 'Implement auth routes',
          taskType: 'API Task',
          parentMilestone: 'M2',
          dependencies: ['T1'],
          requiredSymbols: ['AuthRoute'],
          requiredFiles: ['src/api/auth.ts'],
          expectedOutput: 'Endpoints live',
          estimatedTimeMs: 150000,
          estimatedTokens: 1200,
          risk: 'Medium',
          priority: 'High',
          confidence: 0.9,
          executionStrategy: 'Sequential'
        },
        children: ['T4'],
        parents: ['T1'],
        depth: 1,
        inCriticalPath: true
      },
      'T3': {
        task: {
          taskId: 'T3',
          title: 'Webview UI Dashboard',
          description: 'Build login layout',
          taskType: 'UI Task',
          parentMilestone: 'M3',
          dependencies: ['T1'],
          requiredSymbols: ['LoginView'],
          requiredFiles: ['src/webview/Login.tsx'],
          expectedOutput: 'UI view rendered',
          estimatedTimeMs: 90000,
          estimatedTokens: 800,
          risk: 'Low',
          priority: 'Normal',
          confidence: 0.95,
          executionStrategy: 'Parallel'
        },
        children: ['T4'],
        parents: ['T1'],
        depth: 1,
        inCriticalPath: false
      },
      'T4': {
        task: {
          taskId: 'T4',
          title: 'Integration Test Suite',
          description: 'Write integration test',
          taskType: 'Testing Task',
          parentMilestone: 'M3',
          dependencies: ['T2', 'T3'],
          requiredSymbols: [],
          requiredFiles: ['tests/auth.test.ts'],
          expectedOutput: 'Tests pass',
          estimatedTimeMs: 60000,
          estimatedTokens: 500,
          risk: 'Low',
          priority: 'Normal',
          confidence: 0.95,
          executionStrategy: 'Parallel'
        },
        children: [],
        parents: ['T2', 'T3'],
        depth: 2,
        inCriticalPath: true
      }
    },
    edges: [],
    rootTaskIds: ['T1'],
    leafTaskIds: ['T4'],
    criticalPath: ['T1', 'T2', 'T4'],
    totalEstimatedTimeMs: 420000,
    totalEstimatedTokens: 3500
  };

  it('should transform task graph into an execution plan with steps, parallel groups, and checkpoints', () => {
    const plan = executionPlanner.planExecution({ taskGraph: sampleTaskGraph });

    assert.strictEqual(plan.totalTasks, 4);
    assert.ok(plan.schedule.steps.length === 4);
    assert.ok(plan.schedule.parallelGroups.length >= 2);
    assert.ok(plan.checkpointPlan.length >= 2);
    assert.ok(plan.rollbackBoundaries.length >= 2);
    assert.ok(plan.resourcePlan.memoryLimitMB > 0);
  });

  it('should execute full planning pipeline and return execution planning report', async () => {
    const report = await executionPlanningEngine.plan({ taskGraph: sampleTaskGraph });

    assert.strictEqual(report.validationPassed, true);
    assert.ok(report.confidence >= 0.9);
    assert.strictEqual(report.executionGraph.nodesCount, 4);
    assert.strictEqual(report.executionGraph.criticalPathLength, 3);
  });

  it('should validate plan for circular step dependencies and return errors if broken', () => {
    const brokenPlan: any = {
      planId: 'BROKEN-01',
      strategy: 'Sequential',
      schedule: {
        steps: [
          { stepId: 'S1', taskId: 'T1', taskTitle: 'Step 1', strategy: 'Sequential', workerIndex: 0, estimatedStartTimeMs: 0, estimatedDurationMs: 100, dependencies: ['S2'] },
          { stepId: 'S2', taskId: 'T2', taskTitle: 'Step 2', strategy: 'Sequential', workerIndex: 0, estimatedStartTimeMs: 100, estimatedDurationMs: 100, dependencies: ['S1'] }
        ],
        parallelGroups: [['S1'], ['S2']],
        totalTimeSlots: 2,
        estimatedTotalRuntimeMs: 200
      },
      checkpointPlan: [],
      rollbackBoundaries: [],
      resourcePlan: { cpuLimitPercent: 80, memoryLimitMB: 1024, diskLimitMB: 500, contextWindowTokens: 100000, estimatedTokens: 2000, estimatedRuntimeMs: 200, maxConcurrentWorkers: 2 },
      overallRisk: 'Minimal',
      totalTasks: 2
    };

    const validation = executionValidator.validatePlan(brokenPlan);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Circular execution step dependency')));
  });

  it('should record execution planning metrics', () => {
    const stats = executionMetrics.getStats();
    assert.ok(stats.totalPlansGenerated >= 1);
  });
});

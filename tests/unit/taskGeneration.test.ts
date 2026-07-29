import * as assert from 'assert';
import { taskGenerationEngine } from '../../src/core/taskGeneration/taskGenerationEngine';
import { taskDecomposer } from '../../src/core/taskGeneration/taskDecomposer';
import { taskDependencyResolver } from '../../src/core/taskGeneration/taskDependencyResolver';
import { taskValidator } from '../../src/core/taskGeneration/taskValidator';
import { taskMetrics } from '../../src/core/taskGeneration/taskMetrics';

describe('Task Generation Engine Foundation (M04-S01-T002) Tests', () => {
  const samplePlan = {
    planId: 'PLAN-001',
    title: 'E-Commerce Authentication Feature Plan',
    description: 'Add user authentication flow with DB models, auth REST endpoints, and UI Login page.',
    milestones: [
      {
        milestoneId: 'M1',
        name: 'User Database Schema',
        description: 'Create user database table and migration scripts',
        requirements: ['PostgreSQL schema']
      },
      {
        milestoneId: 'M2',
        name: 'Auth Service Endpoints',
        description: 'Implement auth service API endpoints for login and registration',
        requirements: ['JWT token generation']
      },
      {
        milestoneId: 'M3',
        name: 'Login View Dashboard',
        description: 'Build user frontend login page view and state component',
        requirements: ['React webview login view']
      }
    ]
  };

  it('should decompose milestones into structured tasks using assigned strategies', () => {
    const tasks = taskDecomposer.decomposePlan({ featurePlan: samplePlan });
    assert.ok(tasks.length >= 3);
    assert.ok(tasks.some(t => t.taskType === 'Database Task'));
    assert.ok(tasks.some(t => t.taskType === 'API Task'));
    assert.ok(tasks.some(t => t.taskType === 'UI Task'));
  });

  it('should build a valid DAG task graph with root, leaf nodes and critical path', () => {
    const tasks = taskDecomposer.decomposePlan({ featurePlan: samplePlan });
    const graph = taskDependencyResolver.buildTaskGraph(tasks);

    assert.ok(graph.rootTaskIds.length > 0);
    assert.ok(graph.leafTaskIds.length > 0);
    assert.ok(graph.criticalPath.length > 0);
    assert.ok(graph.totalEstimatedTimeMs > 0);
    assert.ok(graph.totalEstimatedTokens > 0);
  });

  it('should run full task generation pipeline and return topological execution order', async () => {
    const report = await taskGenerationEngine.generateTasks({ featurePlan: samplePlan });

    assert.strictEqual(report.planId, 'PLAN-001');
    assert.strictEqual(report.validationPassed, true);
    assert.ok(report.executionOrder.length > 0);
    assert.ok(report.parallelBranches.length > 0);
    assert.ok(report.confidence >= 0.9);
  });

  it('should detect cycles and report validation errors', () => {
    const invalidTasks: any[] = [
      {
        taskId: 'T1',
        title: 'Task 1',
        description: 'Desc 1',
        taskType: 'Backend Task',
        parentMilestone: 'M1',
        dependencies: ['T2'],
        requiredSymbols: [],
        requiredFiles: [],
        expectedOutput: '',
        estimatedTimeMs: 100,
        estimatedTokens: 10,
        risk: 'Low',
        priority: 'Normal',
        confidence: 0.9,
        executionStrategy: 'Sequential'
      },
      {
        taskId: 'T2',
        title: 'Task 2',
        description: 'Desc 2',
        taskType: 'Backend Task',
        parentMilestone: 'M1',
        dependencies: ['T1'],
        requiredSymbols: [],
        requiredFiles: [],
        expectedOutput: '',
        estimatedTimeMs: 100,
        estimatedTokens: 10,
        risk: 'Low',
        priority: 'Normal',
        confidence: 0.9,
        executionStrategy: 'Sequential'
      }
    ];

    const graph = taskDependencyResolver.buildTaskGraph(invalidTasks);
    const validation = taskValidator.validate(graph, { featurePlan: samplePlan });

    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Circular dependency')));
  });

  it('should record execution metrics', () => {
    const stats = taskMetrics.getStats();
    assert.ok(stats.totalGraphsGenerated >= 1);
  });
});

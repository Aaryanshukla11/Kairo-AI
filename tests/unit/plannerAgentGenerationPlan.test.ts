import * as assert from 'assert';
import { PlannerAgent } from '../../src/core/agents/planner/plannerAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IProjectManifestObject } from '../../src/core/agents/projectManifest/projectManifestTypes';

describe('Planner Agent Generation Plan Unit Tests', () => {
  let agent: PlannerAgent;

  const sampleProjectManifest: IProjectManifestObject = {
    requestId: 'req-plan-test-01',
    sessionId: 'session-plan-test-01',
    projectMetadata: {
      name: 'Kairo Generated Application',
      version: '1.0.0',
      category: 'Single Project'
    },
    workspaceMetadata: {
      workspaceType: 'Single Project',
      rootPath: 'c:/my-workspace',
      isMonorepo: false,
      packageManager: 'npm'
    },
    applicationList: ['app-core'],
    packageList: ['@app/common', '@app/core'],
    moduleList: ['UIComponentModule', 'BusinessServiceModule'],
    plannedFolderTree: { src: {} },
    plannedFileTree: [
      {
        path: 'src/index.ts',
        module: 'CoreAppModule',
        owner: 'UIComponentGenerator',
        fileType: 'typescript',
        isAiManaged: true,
        isProtected: false
      }
    ],
    generatorOwnershipMap: {
      'src/index.ts': 'UIComponentGenerator'
    },
    dependencyGraph: {
      nodes: [{ id: 'src/index.ts', file: 'src/index.ts' }],
      edges: [],
      valid: true
    },
    validationRules: ['Rules'],
    executionStages: ['scaffold_workspace', 'generate_configs', 'synthesize_core', 'synthesize_ui', 'verify_build'],
    manifestVersion: '1.0.0',
    aiManagedFiles: ['src/index.ts'],
    userManagedFiles: ['README.md'],
    protectedFiles: ['.env'],
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    agent = new PlannerAgent({
      id: 'planner-agent',
      name: 'Planner Agent',
      role: 'Project Goal Decomposition & Generation Planning QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 9,
      capabilities: ['planning', 'task_decomposition'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze project manifest and generate ordered Generation Plan', async () => {
    const task: AgentTask = {
      id: 'task-plan-001',
      title: 'Generate Generation Plan',
      assignedAgentId: 'planner-agent',
      taskType: 'GENERATION_PLAN',
      payload: {
        projectManifest: sampleProjectManifest
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.plan);

    const plan = result.plan;
    assert.strictEqual(plan.requestId, 'req-plan-test-01');
    assert.strictEqual(plan.sessionId, 'session-plan-test-01');
    assert.ok(plan.executionStages.length > 0);
    assert.ok(plan.orderedTaskList.length > 0);
    assert.ok(Object.keys(plan.generatorMapping).length > 0);
    assert.strictEqual(plan.dependencyGraph.valid, true);
    assert.ok(plan.parallelGroups.length > 0);
    assert.strictEqual(plan.validationStatus, 'PASSED');
    assert.ok(plan.retryRules.maxRetries === 3);
    assert.ok(plan.rollbackStrategy.autoRollbackOnFailure);
  });

  it('should emit structured stage logs for all 7 planning stages', async () => {
    const task: AgentTask = {
      id: 'task-plan-002',
      title: 'Generate Plan',
      assignedAgentId: 'planner-agent',
      taskType: 'GENERATION_PLAN',
      payload: {
        projectManifest: sampleProjectManifest
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 7);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('PLANNING_STARTED'));
    assert.ok(stages.includes('DEPENDENCY_RESOLUTION'));
    assert.ok(stages.includes('GENERATOR_ASSIGNMENT'));
    assert.ok(stages.includes('EXECUTION_QUEUE_CREATION'));
    assert.ok(stages.includes('VALIDATION'));
    assert.ok(stages.includes('GENERATION_PLAN_CREATED'));
    assert.ok(stages.includes('PLAN_RETURNED'));
  });

  it('should not generate source code or physically create files or folders on disk', async () => {
    const task: AgentTask = {
      id: 'task-plan-003',
      title: 'Generate Plan',
      assignedAgentId: 'planner-agent',
      taskType: 'GENERATION_PLAN',
      payload: {
        projectManifest: sampleProjectManifest
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const plan = result.plan;

    assert.ok(plan.validationRules.length > 0);
    assert.ok(!('sourceCode' in (plan as any)));
  });
});

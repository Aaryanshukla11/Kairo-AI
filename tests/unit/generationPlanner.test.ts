import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { engineeringDecisionEngine } from '../../src/core/code-generation/engineering-decision';
import { architectureGeneratorEngine } from '../../src/core/code-generation/architecture-generator';
import { workspaceScaffolderEngine } from '../../src/core/code-generation/workspace-scaffolder';
import { projectManifestEngine } from '../../src/core/code-generation/project-manifest';
import { generationPlannerEngine } from '../../src/core/code-generation/generation-planner';
import { taskGraphBuilder } from '../../src/core/code-generation/generation-planner/task-graph';

describe('Phase 9 - Generation Planner Engine Tests', () => {

  const dummyIdentity = {
    projectName: 'Hospital App',
    projectType: 'Hospital Management',
    domain: 'Healthcare',
    targetPlatform: 'web'
  };

  const dummyBusiness = {
    targetUsers: ['Doctors', 'Patients'],
    businessGoal: 'Scheduling efficiency',
    deadlines: '2026-09-01'
  };

  const dummyStack = {
    frontend: 'React',
    backend: 'FastAPI',
    database: 'PostgreSQL',
    authentication: 'JWT',
    authorization: 'rbac',
    deployment: 'Docker',
    testing: 'pytest',
    documentation: 'swagger'
  };

  const dummyQuality = {
    performance: ['Load time < 1s'],
    security: ['Enforced SSL'],
    accessibility: ['WCAG AA compliance']
  };

  const dummyExtensions = {
    customInstructions: [],
    generatorPreferences: {},
    futureExtensions: {}
  };

  it('should compile an immutable Generation Plan containing topological ordered tasks and parallel groups', () => {
    // 1. Build requirement contract
    const req = enterpriseRequirementBuilder.build(
      dummyIdentity,
      dummyBusiness,
      dummyStack,
      dummyQuality,
      dummyExtensions,
      'Build Hospital App',
      'Build Hospital App'
    );

    // 2. Build project intelligence
    const intel = projectIntelligenceEngine.analyze(req);

    // 3. Decide tech stack choices
    const decisions = engineeringDecisionEngine.decide(req, intel);

    // 4. Generate Architecture Blueprint
    const arch = architectureGeneratorEngine.generateBlueprint(decisions);

    // 5. Scaffold Workspace Blueprint
    const workspace = workspaceScaffolderEngine.generateBlueprint(arch);

    // 6. Generate Project Manifest
    const manifest = projectManifestEngine.generateManifest(workspace);

    // 7. Plan generation tasks
    const plan = generationPlannerEngine.generatePlan(manifest);

    // Assertions mapping output validation
    assert.ok(plan.taskGraph.nodes.length > 0);
    assert.ok(plan.taskGraph.edges.length > 0);

    // Verify workspace task runs before other tasks
    const orderedIds = plan.orderedTaskList.map(t => t.id);
    const workspaceIdx = orderedIds.indexOf('task-scaffold-workspace');
    const backendIdx = orderedIds.indexOf('task-generate-backend');
    const frontendIdx = orderedIds.indexOf('task-generate-frontend');

    assert.ok(workspaceIdx < backendIdx);
    assert.ok(backendIdx < frontendIdx);

    // Verify parallel grouping setup
    assert.ok(plan.parallelGroups.length > 0);
    assert.strictEqual(plan.parallelGroups[0][0], 'task-scaffold-workspace');

    // Verify checkpoints and rollbacks pathways
    assert.ok(plan.checkpoints.length > 0);
    const databaseCheckpoint = plan.checkpoints.find(c => c.checkpointId === 'checkpoint-database');
    assert.strictEqual(databaseCheckpoint!.rollbackCheckpointId, 'checkpoint-workspace');

    // Verify validation
    assert.strictEqual(plan.validationReport.isValid, true);
    assert.strictEqual(plan.validationReport.violations.length, 0);

    // Verify freezing immutability
    assert.throws(() => {
      (plan as any).planId = 'hack';
    }, /Cannot assign to read only property/);
  });

  it('should detect cycles inside circular dependency graph nodes configurations', () => {
    const mockTasks = [
      {
        id: 'task-A',
        name: 'Task A',
        description: '',
        assignedGeneratorId: '',
        priority: 10,
        dependencies: ['task-B'],
        expectedOutputs: [],
        validationRules: [],
        rollbackPointId: '',
        maxRetries: 1,
        retryDelayMs: 100,
        estimatedComplexity: 'LOW' as const,
        estimatedDurationSeconds: 5,
        failureStrategy: 'ABORT' as const
      },
      {
        id: 'task-B',
        name: 'Task B',
        description: '',
        assignedGeneratorId: '',
        priority: 20,
        dependencies: ['task-A'],
        expectedOutputs: [],
        validationRules: [],
        rollbackPointId: '',
        maxRetries: 1,
        retryDelayMs: 100,
        estimatedComplexity: 'LOW' as const,
        estimatedDurationSeconds: 5,
        failureStrategy: 'ABORT' as const
      }
    ];

    const graph = taskGraphBuilder.buildGraph(mockTasks);
    const { cycles } = taskGraphBuilder.sortTopologically(graph);

    assert.strictEqual(cycles.length, 2);
    assert.ok(cycles.includes('task-A'));
    assert.ok(cycles.includes('task-B'));
  });

});

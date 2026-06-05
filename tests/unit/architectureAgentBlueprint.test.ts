import * as assert from 'assert';
import { ArchitectureAgent } from '../../src/core/agents/architecture/architectureAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IEngineeringDecisionReport } from '../../src/core/agents/engineeringDecision/engineeringDecisionTypes';

describe('Architecture Agent Blueprint Unit Tests', () => {
  let agent: ArchitectureAgent;

  const sampleDecisionReport: IEngineeringDecisionReport = {
    requestId: 'req-arch-test-01',
    sessionId: 'session-arch-test-01',
    selectedArchitecture: 'Component-Driven Single Page Application (SPA)',
    selectedTechStack: {
      language: 'TypeScript',
      frontend: 'React',
      backend: 'Express',
      database: 'PostgreSQL',
      buildTool: 'Vite',
      stateManagement: 'Redux Toolkit',
      deployment: 'Docker'
    },
    selectedFrameworks: {
      uiFramework: 'React DOM',
      serverFramework: 'Express.js',
      ORM: 'Prisma'
    },
    databaseDecision: {
      system: 'PostgreSQL',
      ORM: 'Prisma',
      pooling: true,
      migrationStrategy: 'Prisma Migrations',
      rationale: 'Relational data consistency'
    },
    authenticationDecision: {
      strategy: 'JWT Token Auth',
      tokenType: 'Bearer JWT',
      rationale: 'Stateless scalability'
    },
    apiDecision: {
      style: 'REST',
      format: 'application/json',
      rationale: 'Interoperability'
    },
    buildStrategy: {
      tool: 'Vite',
      bundler: 'ESBuild',
      target: 'es2022',
      rationale: 'Instant cold starts'
    },
    testingStrategy: {
      unitFramework: 'Mocha / Jest',
      integrationFramework: 'Supertest',
      rationale: 'Regression prevention'
    },
    folderStructureStrategy: {
      pattern: 'feature-based',
      description: 'Organizes components by feature module boundaries',
      rationale: 'High cohesion'
    },
    codingStandards: {
      styleGuide: 'TypeScript Standard Style',
      linter: 'ESLint',
      formatter: 'Prettier',
      typeSafety: 'Strict'
    },
    decisionRationales: {
      architecture: 'Clean modularity'
    },
    metadata: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };

  beforeEach(() => {
    agent = new ArchitectureAgent({
      id: 'architecture-agent',
      name: 'Architecture Agent',
      role: 'Project Structural System QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['architecture', 'boundaries'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze engineering decision report and generate validated Architecture Blueprint', async () => {
    const task: AgentTask = {
      id: 'task-arch-001',
      title: 'Generate Architecture Blueprint',
      assignedAgentId: 'architecture-agent',
      payload: {
        engineeringDecisionReport: sampleDecisionReport
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.blueprint);

    const blueprint = result.blueprint;
    assert.strictEqual(blueprint.requestId, 'req-arch-test-01');
    assert.strictEqual(blueprint.sessionId, 'session-arch-test-01');
    assert.ok(blueprint.selectedArchitecturePattern);
    assert.ok(blueprint.layerDiagram.length > 0);
    assert.ok(blueprint.moduleDiagram.length > 0);
    assert.ok(blueprint.packageLayout.length > 0);
    assert.ok(blueprint.folderLayout);
    assert.strictEqual(blueprint.dependencyGraph.hasCircularDependencies, false);
    assert.strictEqual(blueprint.validationStatus, 'PASSED');
    assert.ok(blueprint.designPrinciples.includes('Single Responsibility Principle (SRP)'));
  });

  it('should emit structured stage logs for all 7 architecture stages', async () => {
    const task: AgentTask = {
      id: 'task-arch-002',
      title: 'Generate Blueprint',
      assignedAgentId: 'architecture-agent',
      payload: {
        engineeringDecisionReport: sampleDecisionReport
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 7);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('ARCHITECTURE_GENERATION_STARTED'));
    assert.ok(stages.includes('LAYER_DESIGN'));
    assert.ok(stages.includes('MODULE_DESIGN'));
    assert.ok(stages.includes('DEPENDENCY_ANALYSIS'));
    assert.ok(stages.includes('ARCHITECTURE_VALIDATION'));
    assert.ok(stages.includes('BLUEPRINT_GENERATED'));
    assert.ok(stages.includes('BLUEPRINT_RETURNED'));
  });

  it('should not generate source code or write physical disk files', async () => {
    const task: AgentTask = {
      id: 'task-arch-003',
      title: 'Generate Blueprint',
      assignedAgentId: 'architecture-agent',
      payload: {
        engineeringDecisionReport: sampleDecisionReport
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const blueprint = result.blueprint;

    assert.ok(Array.isArray(blueprint.communicationRules));
    assert.ok(Array.isArray(blueprint.sharedLibraries));
    assert.ok(!('sourceCode' in (blueprint as any)));
  });
});

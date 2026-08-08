import * as assert from 'assert';
import { developmentEngine } from '../../src/core/development-engine-foundation';
import { IDevelopmentRequest } from '../../src/core/planning-validator-handoff/types';
import { IGenerator } from '../../src/core/development-engine-foundation/types';

describe('Sprint 3 - Development Engine Foundation Tests', () => {

  const mockRequest: IDevelopmentRequest = {
    requestId: 'req-dev-100',
    projectInfo: {
      name: 'CMS',
      type: 'Blog',
      description: 'Clean blog CMS',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: 'NodeJS',
      database: 'Postgres',
      authentication: 'JWT',
      deploymentTarget: 'Docker'
    },
    technologyStack: {
      language: 'TypeScript',
      frontend: 'React',
      backend: 'NodeJS',
      database: 'Postgres'
    },
    executionPhases: [
      { phaseId: 'ph1', phaseName: 'Setup', taskIds: ['t1'] },
      { phaseId: 'ph2', phaseName: 'Frontend', taskIds: ['t2'] }
    ],
    validatedTaskGraph: [
      {
        taskId: 't2', // Depends on t1
        taskName: 'Generate React Page',
        taskType: 'GENERATE_FRONTEND',
        description: 'Create frontend react files',
        priority: 'HIGH',
        dependencies: ['t1'],
        input: 'Project layout',
        expectedOutput: 'Index page React code',
        owner: 'FrontendGenerator',
        executionOrder: 2
      },
      {
        taskId: 't1',
        taskName: 'Create Directory Dirs',
        taskType: 'CREATE_STRUCTURE',
        description: 'Initialize directory schema layouts',
        priority: 'CRITICAL',
        dependencies: [],
        input: 'Workspace',
        expectedOutput: 'Dirs setup',
        owner: 'WorkspaceScaffolder',
        executionOrder: 1
      }
    ],
    dependencies: ['t1'],
    warnings: ['No database details specified.'],
    metadata: {
      generatedAt: Date.now(),
      validatedAt: Date.now(),
      schemaVersion: '1.0.0'
    }
  };

  beforeEach(() => {
    developmentEngine.clearGenerators();
  });

  it('should register generators and prepare execution queues topologically sorted', () => {
    // 1. Register Mock Generators
    const mockScaffolder: IGenerator = {
      generatorId: 'scaffolder-gen-1',
      supportedTaskTypes: ['CREATE_STRUCTURE'],
      execute: async () => ({ success: true })
    };

    const mockFrontend: IGenerator = {
      generatorId: 'frontend-gen-1',
      supportedTaskTypes: ['GENERATE_FRONTEND'],
      execute: async () => ({ success: true })
    };

    developmentEngine.registerGenerator(mockScaffolder);
    developmentEngine.registerGenerator(mockFrontend);

    // 2. Prepare Session
    const execution = developmentEngine.prepare(mockRequest);

    assert.strictEqual(execution.project.name, 'CMS');
    assert.strictEqual(execution.progress.t1, 'PENDING');
    assert.strictEqual(execution.progress.t2, 'PENDING');

    // Queue ordering validation: t1 must come before t2 topologically
    assert.deepStrictEqual(execution.executionQueue, ['t1', 't2']);

    // Check generators registry details
    assert.ok(execution.generators.includes('scaffolder-gen-1'));
    assert.ok(execution.generators.includes('frontend-gen-1'));

    // Verify immutability
    assert.throws(() => {
      (execution as any).executionId = 'changed';
    }, /Cannot assign to read only property/);
  });

  it('should flag errors on prepare if tasks use unregistered generators', () => {
    const mockScaffolder: IGenerator = {
      generatorId: 'scaffolder-gen-2',
      supportedTaskTypes: ['CREATE_STRUCTURE'],
      execute: async () => ({ success: true })
    };
    developmentEngine.registerGenerator(mockScaffolder);

    // Prepare request: t2 uses GENERATE_FRONTEND but only CREATE_STRUCTURE is registered
    const execution = developmentEngine.prepare(mockRequest);

    assert.strictEqual(execution.progress.t2, 'FAILED');
    assert.ok(execution.report.errors.some(e => e.taskId === 't2' && e.category === 'DISPATCH'));
  });

  it('should reject circular dependencies in task graphs with scheduling errors', () => {
    const cyclicRequest: IDevelopmentRequest = {
      ...mockRequest,
      validatedTaskGraph: [
        { ...mockRequest.validatedTaskGraph[0], dependencies: ['t1'] },
        { ...mockRequest.validatedTaskGraph[1], dependencies: ['t2'] } // Cycle: t1 -> t2 -> t1
      ]
    };

    assert.throws(() => {
      developmentEngine.prepare(cyclicRequest);
    }, /Circular dependency detected/);
  });

});

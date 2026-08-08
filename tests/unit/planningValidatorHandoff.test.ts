import * as assert from 'assert';
import { planningValidatorHandoff } from '../../src/core/planning-validator-handoff';
import { IPlanningContract } from '../../src/core/planning-contract/types';

describe('Sprint 2 - Planning Validator and Handoff Tests', () => {

  const cleanContract: IPlanningContract = {
    contractVersion: '1.0.0',
    requestId: 'test-req-999',
    projectInfo: {
      name: 'KairoLMS',
      type: 'LMS',
      description: 'Course management project',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: 'NestJS',
      database: 'PostgreSQL',
      authentication: 'JWT',
      deploymentTarget: 'Vercel'
    },
    detectedFeatures: [],
    projectArchitecture: 'Clean Architecture',
    executionPhases: [
      { phaseId: 'p1', phaseName: 'Setup Phase', taskIds: ['t1'] }
    ],
    taskGraph: [
      {
        taskId: 't1',
        taskName: 'Initialize Scaffolding',
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
    warnings: [],
    errors: [],
    metadata: {
      generatedAt: Date.now(),
      planningDurationMs: 250
    }
  };

  it('should validate valid contract and build development handoff successfully', () => {
    const result = planningValidatorHandoff.validateAndHandoff(cleanContract);

    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(result.report.isValid, true);
    assert.ok(result.developmentRequest);
    assert.strictEqual(result.developmentRequest.requestId, 'test-req-999');
    assert.strictEqual(result.developmentRequest.technologyStack.frontend, 'React');

    // Verify immutability
    assert.throws(() => {
      (result.developmentRequest as any).requestId = 'hack';
    }, /Cannot assign to read only property/);
  });

  it('should reject incomplete tasks', () => {
    const faultyContract = {
      ...cleanContract,
      taskGraph: [
        {
          ...cleanContract.taskGraph[0],
          description: '' // Missing description
        }
      ]
    };

    const result = planningValidatorHandoff.validateAndHandoff(faultyContract);

    assert.strictEqual(result.status, 'FAILED');
    assert.strictEqual(result.report.isValid, false);
    assert.strictEqual(result.developmentRequest, null);
    assert.ok(result.report.errors.some(e => e.category === 'TASK'));
  });

  it('should reject tasks with arbitrary shell command safety issues', () => {
    const safetyContract = {
      ...cleanContract,
      taskGraph: [
        {
          ...cleanContract.taskGraph[0],
          description: 'Run rm -rf node_modules and rebuild packages'
        }
      ]
    };

    const result = planningValidatorHandoff.validateAndHandoff(safetyContract);

    assert.strictEqual(result.status, 'FAILED');
    assert.strictEqual(result.report.isValid, false);
    assert.strictEqual(result.developmentRequest, null);
    assert.ok(result.report.errors.some(e => e.category === 'SAFETY'));
  });

  it('should reject tasks trying to breakout path escapes outside workspace', () => {
    const escapeContract = {
      ...cleanContract,
      taskGraph: [
        {
          ...cleanContract.taskGraph[0],
          expectedOutput: 'Created files in ../../../secrets/keys.json'
        }
      ]
    };

    const result = planningValidatorHandoff.validateAndHandoff(escapeContract);

    assert.strictEqual(result.status, 'FAILED');
    assert.strictEqual(result.report.isValid, false);
    assert.ok(result.report.errors.some(e => e.category === 'SAFETY'));
  });

});

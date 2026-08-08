import * as assert from 'assert';
import { planningContractBuilder } from '../../src/core/planning-contract';

describe('Sprint 2 - Planning Contract Module Tests', () => {

  const cleanContract = {
    contractVersion: '1.0.0',
    requestId: 'test-req-001',
    projectInfo: {
      name: 'KairoCMS',
      type: 'CMS',
      description: 'A simple blog CMS',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: 'Node.js',
      database: 'PostgreSQL',
      authentication: 'JWT',
      deploymentTarget: 'Docker'
    },
    detectedFeatures: ['Authentication'],
    projectArchitecture: 'Clean Architecture',
    executionPhases: [
      { phaseId: 'p1', phaseName: 'Setup', taskIds: ['t1'] },
      { phaseId: 'p2', phaseName: 'App Code', taskIds: ['t2'] }
    ],
    taskGraph: [
      {
        taskId: 't1',
        taskName: 'Create Directory Structure',
        taskType: 'CREATE_STRUCTURE' as const,
        description: 'Initialize directory schema layout',
        priority: 'CRITICAL' as const,
        dependencies: [],
        input: 'Workspace',
        expectedOutput: 'Empty dirs setup',
        owner: 'WorkspaceScaffolder',
        executionOrder: 1
      },
      {
        taskId: 't2',
        taskName: 'Generate Auth Frontend',
        taskType: 'GENERATE_FRONTEND' as const,
        description: 'React components logins screen',
        priority: 'HIGH' as const,
        dependencies: ['t1'],
        input: 't1 structure',
        expectedOutput: 'Login page components React code',
        owner: 'FrontendGenerator',
        executionOrder: 2
      }
    ],
    warnings: [],
    errors: [],
    metadata: {
      generatedAt: Date.now(),
      planningDurationMs: 350
    }
  };

  it('should compile valid contract successfully with no validation errors', () => {
    const result = planningContractBuilder.createContract(cleanContract);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.warnings.length, 0);
    
    // Verify immutability
    assert.throws(() => {
      (result as any).contractVersion = '2.0.0';
    }, /Cannot assign to read only property/);
  });

  it('should report validation errors on duplicate task IDs', () => {
    const faultyContract = {
      ...cleanContract,
      taskGraph: [
        { ...cleanContract.taskGraph[0] },
        { ...cleanContract.taskGraph[1], taskId: 't1' } // Duplicate task ID
      ]
    };

    const result = planningContractBuilder.createContract(faultyContract);
    assert.ok(result.errors.some(e => e.includes('Duplicate task ID detected')));
  });

  it('should report circular dependency path errors', () => {
    const cyclicContract = {
      ...cleanContract,
      taskGraph: [
        {
          ...cleanContract.taskGraph[0],
          dependencies: ['t2'] // Cycle t1 -> t2 -> t1
        },
        {
          ...cleanContract.taskGraph[1]
        }
      ]
    };

    const result = planningContractBuilder.createContract(cyclicContract);
    assert.ok(result.errors.some(e => e.includes('Circular dependency path detected')));
  });

  it('should trigger warnings for missing databases or authentication libraries', () => {
    const warningContract = {
      ...cleanContract,
      projectInfo: {
        ...cleanContract.projectInfo,
        database: null,
        authentication: null
      }
    };

    const result = planningContractBuilder.createContract(warningContract);
    assert.ok(result.warnings.includes('Database not selected.'));
    assert.ok(result.warnings.includes('Authentication missing.'));
  });

});

import * as assert from 'assert';
import { codeGenerationPipeline } from '../../src/core/code-generation-pipeline';
import { IDevelopmentRequest } from '../../src/core/planning-validator-handoff/types';
import { ICodingModelProvider } from '../../src/core/coding-runtime/types';

describe('Sprint 4 - Code Generation Pipeline Tests', () => {

  const mockRequest: IDevelopmentRequest = {
    requestId: 'req-dev-999',
    projectInfo: {
      name: 'KairoCMS',
      type: 'Blog',
      description: 'Course management project',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: 'NestJS',
      database: 'PostgreSQL',
      authentication: 'JWT',
      deploymentTarget: 'Vercel'
    },
    technologyStack: {
      language: 'TypeScript',
      frontend: 'React',
      backend: 'NestJS',
      database: 'PostgreSQL'
    },
    executionPhases: [
      { phaseId: 'ph1', phaseName: 'SetupPhase', taskIds: ['t1'] },
      { phaseId: 'ph2', phaseName: 'BackendPhase', taskIds: ['t2'] }
    ],
    validatedTaskGraph: [],
    dependencies: [],
    warnings: [],
    metadata: { generatedAt: Date.now(), validatedAt: Date.now(), schemaVersion: '1.0.0' }
  };

  const sampleModelOutput = JSON.stringify({
    generatedFiles: [{ path: 'src/index.ts', content: 'console.log("Setup");' }],
    modifiedFiles: [],
    createdDirectories: []
  });

  it('should compile modules independently and produce final validated Generation Contracts list', async () => {
    const successProvider: ICodingModelProvider = {
      providerId: 'mock-qwen-coder',
      executeStream: async () => sampleModelOutput
    };

    const progressLogs: string[] = [];
    const result = await codeGenerationPipeline.generateCode(
      mockRequest,
      successProvider,
      (mod) => progressLogs.push(mod)
    );

    assert.strictEqual(result.completedModules.length, 2);
    assert.strictEqual(result.completedModules[0], 'SetupPhase');
    assert.strictEqual(result.completedModules[1], 'BackendPhase');
    assert.strictEqual(result.generatedContracts.length, 2);
    
    // Verify progress callbacks triggered
    assert.ok(progressLogs.includes('SetupPhase'));
    assert.ok(progressLogs.includes('BackendPhase'));
    assert.ok(progressLogs.includes('Completed'));

    // Verify immutability
    assert.throws(() => {
      (result as any).completedModules = [];
    }, /Cannot assign to read only property/);
  });

  it('should recover if a single attempt fails but retry succeeds', async () => {
    let callCount = 0;
    const flakeyProvider: ICodingModelProvider = {
      providerId: 'flakey-coder',
      executeStream: async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Connection lost');
        }
        return sampleModelOutput;
      }
    };

    const result = await codeGenerationPipeline.generateCode(mockRequest, flakeyProvider);

    assert.strictEqual(result.completedModules.length, 2);
    assert.strictEqual(result.failedModules.length, 0);
  });

});

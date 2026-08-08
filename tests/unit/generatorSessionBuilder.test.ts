import * as assert from 'assert';
import { generatorSessionBuilder } from '../../src/core/generator-session-builder';
import { IDevelopmentRequest } from '../../src/core/planning-validator-handoff/types';

describe('Sprint 3 - Generator Session Builder Module Tests', () => {

  const mockRequest: IDevelopmentRequest = {
    requestId: 'req-dev-123',
    projectInfo: {
      name: 'KairoShop',
      type: 'Ecommerce',
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
      { phaseId: 'p1', phaseName: 'Setup Phase', taskIds: ['t1'] }
    ],
    validatedTaskGraph: [
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
    dependencies: [],
    warnings: [],
    metadata: {
      generatedAt: Date.now(),
      validatedAt: Date.now(),
      schemaVersion: '1.0.0'
    }
  };

  it('should compile request into generator session with role instructions and rules', () => {
    const result = generatorSessionBuilder.buildSession(mockRequest);

    // Verify properties mapped
    assert.strictEqual(result.requestPayload.requestId, 'req-dev-123');
    assert.strictEqual(result.requestPayload.technologyStack.language, 'TypeScript');
    assert.strictEqual(result.requestPayload.technologyStack.frontend, 'React');

    // Verify system role
    assert.ok(result.systemRole.includes('Senior Software Engineer'));

    // Verify injected rules
    assert.ok(result.generationRules.includes('Never overwrite unrelated files.'));
    assert.ok(result.generationRules.includes('Never generate placeholder implementations.'));

    // Verify architecture rules
    assert.ok(result.architectureRules.includes('Follow project directory layouts.'));

    // Verify coding standards
    assert.ok(result.codingStandards.namingConventions.includes('camelCase variables'));

    // Verify output contract
    const contract = JSON.parse(result.outputContractSpecification);
    assert.strictEqual(contract.title, 'ICodeGenerationResponse');
    assert.ok(contract.properties.generatedFiles);

    // Verify token estimation
    assert.ok(result.metadata.estimatedTokenCount > 0);

    // Verify immutability
    assert.throws(() => {
      (result as any).sessionId = 'HackID';
    }, /Cannot assign to read only property/);
  });

});

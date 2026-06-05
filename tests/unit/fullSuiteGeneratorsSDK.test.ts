import * as assert from 'assert';
import { ConfigGeneratorSDK } from '../../src/core/agents/generatorSDK/config/configGeneratorSDK';
import { DocumentationGeneratorSDK } from '../../src/core/agents/generatorSDK/documentation/documentationGeneratorSDK';
import { TestingGeneratorSDK } from '../../src/core/agents/generatorSDK/testing/testingGeneratorSDK';
import { GeneratorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';
import { GeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';
import { IGenerationPlanObject } from '../../src/core/agents/planner/plannerTypes';

describe('Configuration, Documentation, and Testing Generator SDK Unit Tests', () => {
  let registry: GeneratorRegistrySDK;
  let sdk: GeneratorSDK;
  let configGen: ConfigGeneratorSDK;
  let docGen: DocumentationGeneratorSDK;
  let testGen: TestingGeneratorSDK;

  const sampleGenerationPlan: IGenerationPlanObject = {
    requestId: 'req-full-suite-01',
    sessionId: 'session-full-suite-01',
    executionStages: ['generate_configs', 'synthesize_core'],
    orderedTaskList: [
      {
        id: 'task-cfg-001',
        title: 'Generate Workspace Configs',
        generatorId: 'ConfigGenerator',
        stage: 'generate_configs',
        targetFiles: ['package.json', 'tsconfig.json'],
        dependencies: []
      },
      {
        id: 'task-doc-001',
        title: 'Generate Project Documentation',
        generatorId: 'DocumentationGenerator',
        stage: 'synthesize_core',
        targetFiles: ['README.md', 'INSTALLATION.md'],
        dependencies: ['task-cfg-001']
      },
      {
        id: 'task-tst-001',
        title: 'Generate Test Suites',
        generatorId: 'TestingGenerator',
        stage: 'synthesize_core',
        targetFiles: ['frontend/tests/unit/components.test.tsx'],
        dependencies: ['task-doc-001']
      }
    ],
    generatorMapping: {
      ConfigGenerator: ['package.json', 'tsconfig.json'],
      DocumentationGenerator: ['README.md', 'INSTALLATION.md'],
      TestingGenerator: ['frontend/tests/unit/components.test.tsx']
    },
    dependencyGraph: { nodes: [], edges: [], valid: true },
    parallelGroups: [],
    validationRules: [],
    retryRules: { maxRetries: 3, backoffMs: 1000, retryableErrors: [] },
    rollbackStrategy: { checkpointIds: ['chk-fs-01'], autoRollbackOnFailure: true },
    estimatedExecutionTimeline: { totalEstimatedMs: 1000, stageBreakdownMs: {} },
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    registry = new GeneratorRegistrySDK();
    sdk = new GeneratorSDK(registry);
    configGen = new ConfigGeneratorSDK();
    docGen = new DocumentationGeneratorSDK();
    testGen = new TestingGeneratorSDK();
    configGen.clearHistory();
    docGen.clearHistory();
    testGen.clearHistory();
  });

  it('should auto-register ConfigGenerator, DocumentationGenerator, and TestingGenerator in GeneratorRegistrySDK', () => {
    const list = registry.list();
    const ids = list.map(g => g.id);

    assert.ok(ids.includes('ConfigGenerator'));
    assert.ok(ids.includes('DocumentationGenerator'));
    assert.ok(ids.includes('TestingGenerator'));
  });

  it('should execute ConfigGenerator, DocumentationGenerator, and TestingGenerator sequentially via GeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-full-suite-01',
      sessionId: 'session-full-suite-01',
      generationPlan: sampleGenerationPlan
    };

    const sdkResult = await sdk.executePlan(context);

    assert.strictEqual(sdkResult.success, true);
    assert.strictEqual(sdkResult.generatorResults.length, 3);
    assert.ok(sdkResult.totalArtifactsCount >= 15);
  });

  it('should emit all 9 required common stage logs for ConfigGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-cfg-logs-01',
      sessionId: 'session-cfg-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await configGen.initialize(context);
    await configGen.prepare(context);
    await configGen.execute(context);

    const logs = configGen.getLogs();
    assert.ok(logs.length >= 9);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('GENERATOR_START'));
    assert.ok(stages.includes('MANIFEST_VALIDATION'));
    assert.ok(stages.includes('DEPENDENCY_VALIDATION'));
    assert.ok(stages.includes('GENERATION'));
    assert.ok(stages.includes('FILE_VALIDATION'));
    assert.ok(stages.includes('DISK_WRITE'));
    assert.ok(stages.includes('ERRORS'));
    assert.ok(stages.includes('WARNINGS'));
    assert.ok(stages.includes('COMPLETION'));
  });

  it('should emit all 9 required common stage logs for DocumentationGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-doc-logs-01',
      sessionId: 'session-doc-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await docGen.initialize(context);
    await docGen.prepare(context);
    await docGen.execute(context);

    const logs = docGen.getLogs();
    assert.ok(logs.length >= 9);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('GENERATOR_START'));
    assert.ok(stages.includes('MANIFEST_VALIDATION'));
    assert.ok(stages.includes('DEPENDENCY_VALIDATION'));
    assert.ok(stages.includes('GENERATION'));
    assert.ok(stages.includes('FILE_VALIDATION'));
    assert.ok(stages.includes('DISK_WRITE'));
    assert.ok(stages.includes('ERRORS'));
    assert.ok(stages.includes('WARNINGS'));
    assert.ok(stages.includes('COMPLETION'));
  });

  it('should emit all 9 required common stage logs for TestingGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-tst-logs-01',
      sessionId: 'session-tst-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await testGen.initialize(context);
    await testGen.prepare(context);
    await testGen.execute(context);

    const logs = testGen.getLogs();
    assert.ok(logs.length >= 9);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('GENERATOR_START'));
    assert.ok(stages.includes('MANIFEST_VALIDATION'));
    assert.ok(stages.includes('DEPENDENCY_VALIDATION'));
    assert.ok(stages.includes('GENERATION'));
    assert.ok(stages.includes('FILE_VALIDATION'));
    assert.ok(stages.includes('DISK_WRITE'));
    assert.ok(stages.includes('ERRORS'));
    assert.ok(stages.includes('WARNINGS'));
    assert.ok(stages.includes('COMPLETION'));
  });
});

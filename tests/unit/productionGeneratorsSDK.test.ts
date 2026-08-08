import * as assert from 'assert';
import { DatabaseGeneratorSDK } from '../../src/core/agents/generatorSDK/database/databaseGeneratorSDK';
import { AuthGeneratorSDK } from '../../src/core/agents/generatorSDK/auth/authGeneratorSDK';
import { ApiGeneratorSDK } from '../../src/core/agents/generatorSDK/api/apiGeneratorSDK';
import { GeneratorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';
import { GeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';
import { IGenerationPlanObject } from '../../src/core/agents/planner/plannerTypes';

describe('Database, Auth, and API Generator SDK Unit Tests', () => {
  let registry: GeneratorRegistrySDK;
  let sdk: GeneratorSDK;
  let dbGen: DatabaseGeneratorSDK;
  let authGen: AuthGeneratorSDK;
  let apiGen: ApiGeneratorSDK;

  const sampleGenerationPlan: IGenerationPlanObject = {
    requestId: 'req-prod-gens-01',
    sessionId: 'session-prod-gens-01',
    executionStages: ['synthesize_core', 'synthesize_ui'],
    orderedTaskList: [
      {
        id: 'task-db-001',
        title: 'Generate Database Schema & ORM',
        generatorId: 'DatabaseGenerator',
        stage: 'synthesize_core',
        targetFiles: ['database/schema.sql'],
        dependencies: []
      },
      {
        id: 'task-auth-001',
        title: 'Generate Auth & Security Layer',
        generatorId: 'AuthGenerator',
        stage: 'synthesize_core',
        targetFiles: ['backend/src/routes/auth.ts'],
        dependencies: ['task-db-001']
      },
      {
        id: 'task-api-001',
        title: 'Generate REST API Contracts & DTOs',
        generatorId: 'ApiGenerator',
        stage: 'synthesize_ui',
        targetFiles: ['frontend/src/services/apiService.ts'],
        dependencies: ['task-auth-001']
      }
    ],
    generatorMapping: {
      DatabaseGenerator: ['database/schema.sql'],
      AuthGenerator: ['backend/src/routes/auth.ts'],
      ApiGenerator: ['frontend/src/services/apiService.ts']
    },
    dependencyGraph: { nodes: [], edges: [], valid: true },
    parallelGroups: [],
    validationRules: [],
    retryRules: { maxRetries: 3, backoffMs: 1000, retryableErrors: [] },
    rollbackStrategy: { checkpointIds: ['chk-01'], autoRollbackOnFailure: true },
    estimatedExecutionTimeline: { totalEstimatedMs: 1000, stageBreakdownMs: {} },
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    registry = new GeneratorRegistrySDK();
    sdk = new GeneratorSDK(registry);
    dbGen = new DatabaseGeneratorSDK();
    authGen = new AuthGeneratorSDK();
    apiGen = new ApiGeneratorSDK();
    dbGen.clearHistory();
    authGen.clearHistory();
    apiGen.clearHistory();
  });

  it('should auto-register DatabaseGenerator, AuthGenerator, and ApiGenerator in GeneratorRegistrySDK', () => {
    const list = registry.list();
    const ids = list.map(g => g.id);

    assert.ok(ids.includes('DatabaseGenerator'));
    assert.ok(ids.includes('AuthGenerator'));
    assert.ok(ids.includes('ApiGenerator'));
  });

  it('should execute DatabaseGenerator, AuthGenerator, and ApiGenerator sequentially via GeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-prod-gens-01',
      sessionId: 'session-prod-gens-01',
      generationPlan: sampleGenerationPlan
    };

    const sdkResult = await sdk.executePlan(context);

    assert.strictEqual(sdkResult.success, true);
    assert.strictEqual(sdkResult.generatorResults.length, 3);
    assert.ok(sdkResult.totalArtifactsCount >= 10);
  });

  it('should emit all 9 required common stage logs for DatabaseGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-db-logs-01',
      sessionId: 'session-db-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await dbGen.initialize(context);
    await dbGen.prepare(context);
    await dbGen.execute(context);

    const logs = dbGen.getLogs();
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

  it('should emit all 9 required common stage logs for AuthGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-auth-logs-01',
      sessionId: 'session-auth-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await authGen.initialize(context);
    await authGen.prepare(context);
    await authGen.execute(context);

    const logs = authGen.getLogs();
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

  it('should emit all 9 required common stage logs for ApiGeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-api-logs-01',
      sessionId: 'session-api-logs-01',
      generationPlan: sampleGenerationPlan
    };

    await apiGen.initialize(context);
    await apiGen.prepare(context);
    await apiGen.execute(context);

    const logs = apiGen.getLogs();
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

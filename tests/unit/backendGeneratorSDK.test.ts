import * as assert from 'assert';
import { BackendGeneratorSDK } from '../../src/core/agents/generatorSDK/backend/backendGeneratorSDK';
import { GeneratorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';
import { GeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';
import { IGenerationPlanObject } from '../../src/core/agents/planner/plannerTypes';

describe('Backend Generator SDK Unit Tests', () => {
  let backendGen: BackendGeneratorSDK;
  let registry: GeneratorRegistrySDK;
  let sdk: GeneratorSDK;

  const sampleGenerationPlan: IGenerationPlanObject = {
    requestId: 'req-be-test-01',
    sessionId: 'session-be-test-01',
    executionStages: ['synthesize_core'],
    orderedTaskList: [
      {
        id: 'task-be-001',
        title: 'Synthesize Backend Services',
        generatorId: 'BackendGenerator',
        stage: 'synthesize_core',
        targetFiles: ['src/services/apiService.ts'],
        dependencies: []
      }
    ],
    generatorMapping: { BackendGenerator: ['src/services/apiService.ts'] },
    dependencyGraph: { nodes: [], edges: [], valid: true },
    parallelGroups: [],
    validationRules: [],
    retryRules: { maxRetries: 3, backoffMs: 1000, retryableErrors: [] },
    rollbackStrategy: { checkpointIds: ['chk-be-01'], autoRollbackOnFailure: true },
    estimatedExecutionTimeline: { totalEstimatedMs: 500, stageBreakdownMs: {} },
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    backendGen = new BackendGeneratorSDK();
    backendGen.clearHistory();
    registry = new GeneratorRegistrySDK();
    sdk = new GeneratorSDK(registry);
  });

  it('should consume full IGeneratorExecutionContext and execute backend synthesis via GeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-be-test-01',
      sessionId: 'session-be-test-01',
      engineeringDecisionReport: {
        requestId: 'req-be-test-01',
        sessionId: 'session-be-test-01',
        selectedArchitecture: 'RESTful Microservice Architecture',
        selectedTechStack: {
          language: 'TypeScript',
          frontend: null,
          backend: 'Express',
          database: 'PostgreSQL',
          buildTool: 'Vite',
          stateManagement: null,
          deployment: 'Docker'
        },
        selectedFrameworks: {
          uiFramework: null,
          serverFramework: 'Express.js',
          ORM: 'Prisma'
        },
        databaseDecision: { system: 'PostgreSQL', ORM: 'Prisma', pooling: true, migrationStrategy: 'Prisma Migrations', rationale: '' },
        authenticationDecision: { strategy: 'JWT', tokenType: 'Bearer', rationale: '' },
        apiDecision: { style: 'REST', format: 'json', rationale: '' },
        buildStrategy: { tool: 'Vite', bundler: 'ESBuild', target: 'es2022', rationale: '' },
        testingStrategy: { unitFramework: 'Mocha', integrationFramework: 'Supertest', rationale: '' },
        folderStructureStrategy: { pattern: 'layer-based', description: '', rationale: '' },
        codingStandards: { styleGuide: 'Standard', linter: 'ESLint', formatter: 'Prettier', typeSafety: 'Strict' },
        decisionRationales: {},
        metadata: { timestamp: Date.now(), version: '1.0.0' }
      },
      generationPlan: sampleGenerationPlan
    };

    const sdkResult = await sdk.executePlan(context);

    assert.strictEqual(sdkResult.success, true);
    assert.ok(sdkResult.generatorResults.length > 0);

    const beResult = sdkResult.generatorResults.find(r => r.generatorId === 'BackendGenerator');
    assert.ok(beResult);
    assert.strictEqual(beResult!.success, true);
    assert.ok(beResult!.generatedArtifacts.includes('src/services/apiService.ts'));
  });

  it('should emit structured stage logs for all 9 backend generation stages', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-be-test-02',
      sessionId: 'session-be-test-02',
      generationPlan: sampleGenerationPlan
    };

    await backendGen.initialize(context);
    await backendGen.prepare(context);
    await backendGen.execute(context);

    const logs = backendGen.getLogs();
    assert.ok(logs.length >= 9);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('BACKEND_GENERATION_STARTED'));
    assert.ok(stages.includes('MANIFEST_VALIDATION'));
    assert.ok(stages.includes('MODULE_PLANNING'));
    assert.ok(stages.includes('CODE_GENERATION'));
    assert.ok(stages.includes('DEPENDENCY_VALIDATION'));
    assert.ok(stages.includes('FILE_VALIDATION'));
    assert.ok(stages.includes('DISK_WRITE'));
    assert.ok(stages.includes('GENERATION_SUMMARY'));
    assert.ok(stages.includes('ERRORS_AND_WARNINGS'));
  });

  it('should respect protected file boundaries and skip protected files', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-be-test-03',
      sessionId: 'session-be-test-03',
      projectManifest: {
        requestId: 'req-be-test-03',
        sessionId: 'session-be-test-03',
        projectMetadata: { name: 'App', version: '1.0.0', category: 'Single Project' },
        workspaceMetadata: { workspaceType: 'Single Project', rootPath: 'c:/proj', isMonorepo: false, packageManager: 'npm' },
        applicationList: ['app'],
        packageList: ['pkg'],
        moduleList: ['mod'],
        plannedFolderTree: {},
        plannedFileTree: [],
        generatorOwnershipMap: {},
        dependencyGraph: { nodes: [], edges: [], valid: true },
        validationRules: [],
        executionStages: [],
        manifestVersion: '1.0.0',
        aiManagedFiles: [],
        userManagedFiles: ['.env'],
        protectedFiles: ['.env', 'user_config/custom_settings.json'],
        validationStatus: 'PASSED',
        metadata: { timestamp: Date.now(), version: '1.0.0' }
      },
      generationPlan: sampleGenerationPlan
    };

    const res = await backendGen.execute(context);
    assert.strictEqual(res.success, true);
    assert.ok(!res.generatedArtifacts.includes('.env'));
  });
});

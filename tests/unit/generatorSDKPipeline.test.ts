import * as assert from 'assert';
import { generatorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';
import { globalGeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';
import { GeneratorSDKAgent } from '../../src/core/agents/generatorSDK/generatorSDKAgent';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Blocker #3 - Generator SDK Pipeline Execution Tests', () => {

  const samplePlan = {
    requestId: 'req-sdk-001',
    sessionId: 'session-sdk-001',
    executionStages: ['generate_configs', 'synthesize_core', 'synthesize_ui', 'verify_build'],
    orderedTaskList: [
      { id: 't1', title: 'Config Task', generatorId: 'config-generator', stage: 'generate_configs', targetFiles: ['package.json'] },
      { id: 't2', title: 'Backend Task', generatorId: 'backend-generator', stage: 'synthesize_core', targetFiles: ['src/server.ts'] },
      { id: 't3', title: 'UI Task', generatorId: 'frontend-generator', stage: 'synthesize_ui', targetFiles: ['src/App.tsx'] },
      { id: 't4', title: 'DB Task', generatorId: 'database-generator', stage: 'synthesize_core', targetFiles: ['prisma/schema.prisma'] },
      { id: 't5', title: 'Auth Task', generatorId: 'auth-generator', stage: 'synthesize_core', targetFiles: ['src/auth.ts'] },
      { id: 't6', title: 'API Task', generatorId: 'api-generator', stage: 'synthesize_core', targetFiles: ['src/api.ts'] },
      { id: 't7', title: 'Docs Task', generatorId: 'documentation-generator', stage: 'synthesize_ui', targetFiles: ['README.md'] },
      { id: 't8', title: 'Testing Task', generatorId: 'testing-generator', stage: 'verify_build', targetFiles: ['tests/app.test.ts'] }
    ],
    generatorMapping: {},
    dependencyGraph: { nodes: [], edges: [], valid: true },
    parallelGroups: [],
    validationRules: [],
    retryRules: { maxRetries: 3, backoffMs: 1000, retryableErrors: [] },
    rollbackStrategy: { checkpointIds: [], autoRollbackOnFailure: true },
    estimatedExecutionTimeline: { totalEstimatedMs: 1000, stageBreakdownMs: {} },
    validationStatus: 'PASSED' as const,
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  const validContext: IGeneratorExecutionContext = {
    requestId: 'req-sdk-001',
    sessionId: 'session-sdk-001',
    generationPlan: samplePlan
  };

  it('TEST 1 & TEST 2: Valid generationPlan reaches GeneratorSDKAgent and SDK receives non-empty tasks', async () => {
    const agent = new GeneratorSDKAgent({
      id: 'generator-sdk-agent',
      name: 'Generator SDK Agent',
      role: 'Central Framework Execution',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['generator_sdk'],
      permissions: ['READ', 'WRITE']
    });

    const agentTask = {
      id: 'task-sdk-test',
      title: 'Execute Generator SDK',
      assignedAgentId: 'generator-sdk-agent',
      payload: {
        requestId: 'req-sdk-001',
        sessionId: 'session-sdk-001',
        plannerResult: { plan: samplePlan }
      },
      status: 'pending' as const
    };

    const res = await agent.executeTask(agentTask);
    assert.strictEqual(res.success, true);
    assert.ok(res.result.generatorResults.length >= 8);
    assert.ok(res.result.totalArtifactsCount > 0);
  });

  it('TEST 3 & TEST 5: At least one real generator executes and GenerationContracts are produced', async () => {
    const sdkResult = await generatorSDK.executePlan(validContext);
    assert.strictEqual(sdkResult.success, true);
    assert.ok(sdkResult.generatorResults.length > 0);
    assert.ok(sdkResult.contracts && sdkResult.contracts.length > 0, 'GenerationContracts must be produced');

    const firstContract = sdkResult.contracts[0];
    assert.ok(firstContract.contractVersion);
    assert.ok(firstContract.fileOperations && firstContract.fileOperations.length > 0);
  });

  it('TEST 4: All 8 registered generator types can be selected and executed when present in plan', async () => {
    const sdkResult = await generatorSDK.executePlan(validContext);
    const executedGenIds = sdkResult.generatorResults.map(r => r.generatorId.toLowerCase());

    assert.ok(executedGenIds.some(id => id.includes('config')));
    assert.ok(executedGenIds.some(id => id.includes('backend')));
    assert.ok(executedGenIds.some(id => id.includes('uicomponent') || id.includes('frontend')));
    assert.ok(executedGenIds.some(id => id.includes('database')));
    assert.ok(executedGenIds.some(id => id.includes('auth')));
    assert.ok(executedGenIds.some(id => id.includes('api')));
    assert.ok(executedGenIds.some(id => id.includes('documentation')));
    assert.ok(executedGenIds.some(id => id.includes('testing')));
  });

  it('TEST 6: Undefined generationPlan fails explicitly with clear error', async () => {
    const invalidContext: IGeneratorExecutionContext = {
      requestId: 'req-fail-001',
      sessionId: 'session-fail-001',
      generationPlan: undefined
    };

    await assert.rejects(async () => {
      await generatorSDK.executePlan(invalidContext);
    }, /generationPlan is undefined or missing/);
  });

  it('TEST 7: Empty generationPlan orderedTaskList fails explicitly with clear error', async () => {
    const emptyContext: IGeneratorExecutionContext = {
      requestId: 'req-fail-002',
      sessionId: 'session-fail-002',
      generationPlan: {
        ...samplePlan,
        orderedTaskList: []
      }
    };

    await assert.rejects(async () => {
      await generatorSDK.executePlan(emptyContext);
    }, /orderedTaskList is empty or missing generator tasks/);
  });

  it('TEST 8: Generator failure propagates correctly and halts execution', async () => {
    const failingPlan = {
      ...samplePlan,
      orderedTaskList: [
        { id: 't1', title: 'Invalid Generator Task', generatorId: 'non-existent-generator-123', stage: 'generate_configs', targetFiles: [] }
      ]
    };

    const failContext: IGeneratorExecutionContext = {
      requestId: 'req-fail-003',
      sessionId: 'session-fail-003',
      generationPlan: failingPlan
    };

    await assert.rejects(async () => {
      await generatorSDK.executePlan(failContext);
    }, /is not registered in SDK registry/);
  });

  it('TEST 9: No duplicate generator execution for single task', async () => {
    const sdkResult = await generatorSDK.executePlan(validContext);
    const results = sdkResult.generatorResults;
    const taskGenPairs = results.map(r => r.generatorId);
    
    assert.strictEqual(taskGenPairs.length, samplePlan.orderedTaskList.length);
  });

});

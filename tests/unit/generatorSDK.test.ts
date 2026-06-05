import * as assert from 'assert';
import { GeneratorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';
import { GeneratorSDKAgent } from '../../src/core/agents/generatorSDK/generatorSDKAgent';
import { GeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';
import { IGenerationPlanObject } from '../../src/core/agents/planner/plannerTypes';

describe('Generator SDK Unit Tests', () => {
  let sdk: GeneratorSDK;
  let agent: GeneratorSDKAgent;
  let registry: GeneratorRegistrySDK;

  const sampleGenerationPlan: IGenerationPlanObject = {
    requestId: 'req-sdk-test-01',
    sessionId: 'session-sdk-test-01',
    executionStages: ['generate_configs', 'synthesize_core', 'synthesize_ui'],
    orderedTaskList: [
      {
        id: 'task-gen-001',
        title: 'Generate Configs',
        generatorId: 'ConfigGenerator',
        stage: 'generate_configs',
        targetFiles: ['package.json'],
        dependencies: []
      },
      {
        id: 'task-gen-002',
        title: 'Synthesize Shared Utilities',
        generatorId: 'SharedUtilGenerator',
        stage: 'synthesize_core',
        targetFiles: ['src/common/utils.ts'],
        dependencies: ['task-gen-001']
      }
    ],
    generatorMapping: {
      ConfigGenerator: ['package.json'],
      SharedUtilGenerator: ['src/common/utils.ts']
    },
    dependencyGraph: { nodes: [], edges: [], valid: true },
    parallelGroups: [],
    validationRules: ['Generators execute strictly in stage order'],
    retryRules: { maxRetries: 3, backoffMs: 1000, retryableErrors: [] },
    rollbackStrategy: { checkpointIds: ['chk-001'], autoRollbackOnFailure: true },
    estimatedExecutionTimeline: { totalEstimatedMs: 1000, stageBreakdownMs: {} },
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    registry = new GeneratorRegistrySDK();
    sdk = new GeneratorSDK(registry);
    agent = new GeneratorSDKAgent(
      {
        id: 'generator-sdk-agent',
        name: 'Generator SDK Agent',
        role: 'Central Code Generator Framework Execution QA',
        version: '1.0.0',
        status: AgentStatus.Idle,
        priority: 10,
        capabilities: ['generator_sdk', 'code_generation'],
        permissions: ['READ', 'WRITE']
      },
      sdk
    );
    sdk.clearHistory();
  });

  it('should auto-register default generators during startup in GeneratorRegistrySDK', () => {
    const list = registry.list();
    assert.ok(list.length >= 4);

    const ids = list.map(g => g.id);
    assert.ok(ids.includes('ConfigGenerator'));
    assert.ok(ids.includes('SharedUtilGenerator'));
    assert.ok(ids.includes('BackendGenerator'));
    assert.ok(ids.includes('UIComponentGenerator'));
  });

  it('should execute full 7-stage lifecycle across planned generators via GeneratorSDK', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-sdk-test-01',
      sessionId: 'session-sdk-test-01',
      generationPlan: sampleGenerationPlan
    };

    const sdkResult = await sdk.executePlan(context);

    assert.strictEqual(sdkResult.success, true);
    assert.strictEqual(sdkResult.generatorResults.length, 2);
    assert.ok(sdkResult.totalArtifactsCount > 0);
  });

  it('should emit structured stage logs for all 7 SDK lifecycle stages', async () => {
    const context: IGeneratorExecutionContext = {
      requestId: 'req-sdk-test-02',
      sessionId: 'session-sdk-test-02',
      generationPlan: sampleGenerationPlan
    };

    await sdk.executePlan(context);

    const logs = sdk.getLogs();
    assert.ok(logs.length >= 7);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('GENERATOR_REGISTRATION'));
    assert.ok(stages.includes('GENERATOR_INITIALIZATION'));
    assert.ok(stages.includes('GENERATOR_EXECUTION'));
    assert.ok(stages.includes('VALIDATION'));
    assert.ok(stages.includes('FINALIZATION'));
    assert.ok(stages.includes('COMPLETION'));
  });

  it('should execute task correctly via GeneratorSDKAgent dispatch', async () => {
    const task: AgentTask = {
      id: 'task-sdk-agent-01',
      title: 'Execute SDK Framework',
      assignedAgentId: 'generator-sdk-agent',
      taskType: 'GENERATOR_SDK',
      payload: {
        generationPlan: sampleGenerationPlan
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.result);
    assert.strictEqual(result.result.requestId, 'task-sdk-agent-01');
    assert.ok(result.result.totalArtifactsCount > 0);
  });
});

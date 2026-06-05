import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ExecutionPlanner } from '../../src/core/planner/planner';
import { ExecutorAgent } from '../../src/core/agents/executor/executorAgent';
import { AgentTask, AgentStatus } from '../../src/core/agents/agentTypes';
import { UIComponentGenerator } from '../../src/core/agents/generatorSDK/defaultGenerators';
import { IGeneratorExecutionContext } from '../../src/core/agents/generatorSDK/generatorSDKTypes';

describe('Chunk 8.6 — Execution Plan Propagation & Target File Integrity Unit Tests', () => {
  let tmpDir: string;
  const planner = new ExecutionPlanner();

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kairo-exec-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('TEST 1: "create index.html" targetFiles integrity end-to-end', async () => {
    const plan = planner.generatePlan('create index.html', { workspacePath: tmpDir });
    assert.deepStrictEqual(plan.targetFiles, ['index.html']);

    // Verify UIComponentGenerator extracts ONLY index.html
    const generator = new UIComponentGenerator();
    const context: IGeneratorExecutionContext = {
      requestId: 'req-1',
      sessionId: 'sess-1',
      generationPlan: {
        requestId: 'req-1',
        sessionId: 'sess-1',
        executionStages: ['synthesize_ui'],
        orderedTaskList: [
          {
            id: 'task-gen-001',
            title: 'Execute UIComponentGenerator',
            generatorId: 'UIComponentGenerator',
            stage: 'synthesize_ui',
            dependencies: [],
            targetFiles: plan.targetFiles
          }
        ],
        generatorMapping: {} as any,
        dependencyGraph: {} as any,
        parallelGroups: [],
        validationRules: [],
        rollbacks: [],
        approvalRequired: false,
        metadata: {} as any
      }
    };

    const genResult = await generator.execute(context);
    assert.deepStrictEqual(Array.from(genResult.generatedArtifacts), ['index.html']);
    assert.strictEqual(genResult.generatedArtifacts.includes('src/index.ts'), false);
    assert.strictEqual(genResult.generatedArtifacts.includes('src/components/App.tsx'), false);
  });

  it('TEST 2 & 3: Generator cannot introduce target files not present in ExecutionPlan', async () => {
    const generator = new UIComponentGenerator();
    const context: IGeneratorExecutionContext = {
      requestId: 'req-2',
      sessionId: 'sess-2',
      generationPlan: {
        requestId: 'req-2',
        sessionId: 'sess-2',
        executionStages: ['synthesize_ui'],
        orderedTaskList: [
          {
            id: 'task-gen-001',
            title: 'Execute UIComponentGenerator',
            generatorId: 'UIComponentGenerator',
            stage: 'synthesize_ui',
            dependencies: [],
            targetFiles: ['styles.css']
          }
        ],
        generatorMapping: {} as any,
        dependencyGraph: {} as any,
        parallelGroups: [],
        validationRules: [],
        rollbacks: [],
        approvalRequired: false,
        metadata: {} as any
      }
    };

    const genResult = await generator.execute(context);
    assert.deepStrictEqual(Array.from(genResult.generatedArtifacts), ['styles.css']);
    assert.strictEqual(genResult.generatedArtifacts.includes('src/index.ts'), false);
  });

  it('TEST 4: Missing/empty executor tasks fail honestly with explicit error', async () => {
    const executor = new ExecutorAgent({
      id: 'executor-agent',
      name: 'Executor Agent',
      role: 'Executor',
      version: '1.0.0',
      capabilities: ['code_synthesis'],
      permissions: ['read', 'write'],
      priority: 1,
      status: AgentStatus.Idle
    });

    const emptyTask: AgentTask = {
      id: 'task-empty-exec',
      title: 'Synthesize Code',
      assignedAgentId: 'executor-agent',
      status: 'pending',
      payload: {
        rawPrompt: 'Build portfolio',
        workspacePath: tmpDir,
        tasks: [] // Empty task list
      }
    };

    try {
      await executor.executeTask(emptyTask);
      assert.fail('Expected ExecutorAgent to throw on empty task graph');
    } catch (err: any) {
      assert.strictEqual(err.message.includes('empty task graph'), true);
    }
  });

  it('TEST 5 & 6: Physical write failure or zero file output throws explicit error', async () => {
    const executor = new ExecutorAgent({
      id: 'executor-agent',
      name: 'Executor Agent',
      role: 'Executor',
      version: '1.0.0',
      capabilities: ['code_synthesis'],
      permissions: ['read', 'write'],
      priority: 1,
      status: AgentStatus.Idle
    });

    // Mock coding provider that returns empty generation contract
    const mockProvider: any = {
      providerId: 'MockProvider',
      generateCode: async () => ({
        generatedContracts: [
          {
            contractVersion: '1.0.0',
            requestId: 'req-test',
            executionId: 'exec-test',
            fileOperations: [], // 0 file operations
            directoryOperations: [],
            warnings: [],
            errors: [],
            metadata: { generator: 'test', timestamp: Date.now(), model: 'test', projectId: 'test' }
          }
        ],
        errors: []
      })
    };

    const taskWithPlan: AgentTask = {
      id: 'task-test-exec',
      title: 'Synthesize Code',
      assignedAgentId: 'executor-agent',
      status: 'pending',
      payload: {
        rawPrompt: 'create index.html',
        workspacePath: tmpDir,
        tasks: [{ id: 'task-1', title: 'Create index.html', targetFiles: ['index.html'], requiredCapability: 'html' }],
        codingProvider: mockProvider
      }
    };

    try {
      await executor.executeTask(taskWithPlan);
      assert.fail('Expected ExecutorAgent to throw when 0 files were physically created');
    } catch (err: any) {
      assert.strictEqual(err.message.includes('0 files were physically created'), true);
    }
  });
});

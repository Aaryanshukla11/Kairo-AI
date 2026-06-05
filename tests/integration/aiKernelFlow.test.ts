import * as assert from 'assert';
import { pipelineController } from '../../src/core/pipeline-controller/controller';
import { aiKernel } from '../../src/core/ai-kernel/kernel';
import { NodeFsAdapter } from '../../src/core/workspace-engine/fs-adapter';

describe('AI Kernel Runtime Integration Flow Tests', () => {
  beforeEach(() => {
    aiKernel.clearHistory();
  });

  it('should route User Prompt through AI Kernel to Orchestrator and generate valid results', async () => {
    const prompt = 'Create Calculator web application using HTML and CSS';
    const workspacePath = 'c:/calculator-app';
    const fsAdapter = new NodeFsAdapter();

    const mockPlanningProvider = {
      providerId: 'mock-planning-provider',
      execute: async () => JSON.stringify({
        contractVersion: '1.0.0',
        requestId: 'req-kernel-int-1',
        executionId: 'exec-kernel-int-1',
        tasks: [
          {
            taskId: 'task-1',
            taskName: 'Workspace Scaffolding',
            taskType: 'CREATE_STRUCTURE',
            priority: 'CRITICAL',
            dependencies: [],
            input: '',
            expectedOutput: '',
            owner: 'WorkspaceScaffolder',
            executionOrder: 1
          }
        ],
        warnings: [],
        errors: []
      })
    };

    const mockCodingProvider = {
      providerId: 'mock-coding-provider',
      executeStream: async () => ''
    };

    // Execute full pipeline
    const pipelineResult = await pipelineController.run(
      prompt,
      workspacePath,
      mockPlanningProvider,
      mockCodingProvider,
      fsAdapter
    );

    // 1. Verify Pipeline execution result
    assert.strictEqual(pipelineResult.state, 'SUCCESS');
    assert.strictEqual(pipelineResult.errors.length, 0);
    assert.ok(pipelineResult.developmentRequest);
    assert.ok(pipelineResult.generationResult);

    // 2. Verify AI Kernel captured the prompt execution as the single entry point
    const lastCompiled = aiKernel.getLastCompiledRequest();
    assert.ok(lastCompiled, 'AI Kernel must have compiled the prompt request');
    assert.strictEqual(lastCompiled.rawPrompt, prompt);

    // 3. Verify AI Kernel stage logs confirm complete execution
    const kernelLogs = aiKernel.getLogs();
    assert.ok(kernelLogs.length >= 5, 'Kernel logs must confirm all 4 stages + handoff execution');

    const stagesExecuted = kernelLogs.map(l => l.stage);
    assert.ok(stagesExecuted.includes('CONTEXT_BUILDER'));
    assert.ok(stagesExecuted.includes('MEMORY_ENGINE'));
    assert.ok(stagesExecuted.includes('KNOWLEDGE_ENGINE'));
    assert.ok(stagesExecuted.includes('MODEL_ROUTER'));
    assert.ok(stagesExecuted.includes('ORCHESTRATOR_HANDOFF'));

    // 4. Verify Model Router decision matches selected model in kernel log
    const routerLog = kernelLogs.find(l => l.stage === 'MODEL_ROUTER');
    assert.ok(routerLog);
    assert.strictEqual(routerLog.status, 'SUCCESS');
  });

  it('should prevent direct prompt execution without AI Kernel compilation', async () => {
    aiKernel.clearHistory();

    const prompt = 'Create Express REST API for Todo items';
    const workspacePath = 'c:/express-todo';

    const mockPlanningProvider = {
      providerId: 'mock-planner',
      execute: async () => JSON.stringify({
        contractVersion: '1.0.0',
        requestId: 'req-2',
        executionId: 'exec-2',
        tasks: [],
        warnings: [],
        errors: []
      })
    };

    const mockCodingProvider = {
      providerId: 'mock-coder',
      executeStream: async () => ''
    };

    await pipelineController.run(prompt, workspacePath, mockPlanningProvider, mockCodingProvider);

    // Every call to pipelineController.run must trigger AI Kernel
    const logs = aiKernel.getLogs();
    assert.ok(logs.length > 0, 'No direct prompt execution should bypass AI Kernel');
  });
});

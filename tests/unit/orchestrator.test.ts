import * as assert from 'assert';
import { OrchestratorEngine, orchestratorEngine } from '../../src/core/orchestrator/orchestratorEngine';
import { IAIKernelCompiledRequest } from '../../src/core/ai-kernel/types';

describe('Orchestrator Unit Tests', () => {
  let orchestrator: OrchestratorEngine;

  const sampleCompiledRequest: IAIKernelCompiledRequest = {
    requestId: 'req-orch-test-001',
    timestamp: Date.now(),
    rawPrompt: 'Build a Todo application with React and TypeScript',
    normalizedPrompt: 'Build a Todo application with React and TypeScript',
    intent: 'Web/Frontend',
    promptContext: {
      id: 'req-orch-test-001',
      timestamp: Date.now(),
      rawPrompt: 'Build a Todo application with React and TypeScript',
      normalizedPrompt: 'Build a Todo application with React and TypeScript',
      intent: 'Web/Frontend',
      confidence: 0.95,
      projectInfo: { name: 'TodoApp', type: 'Web/Frontend' },
      workspaceInfo: { isEmpty: true, isProjectPresent: false, isMonorepo: false, hasGit: true },
      detectedTechnologies: {
        language: 'TypeScript',
        frontend: 'React',
        backend: null,
        database: null,
        authMethod: null,
        apiStyle: null,
        uiFramework: null,
        cssFramework: null,
        stateManagement: null,
        buildTool: 'Vite'
      },
      detectedFeatures: ['TodoList'],
      existingFiles: [],
      dependencies: [],
      warnings: [],
      metadata: { length: 50, lineCount: 1, hasMarkdown: false }
    },
    aiRequest: {
      requestId: 'req-orch-test-001',
      timestamp: Date.now(),
      prompt: 'Build a Todo application with React and TypeScript',
      intent: 'Web/Frontend',
      project: { name: 'TodoApp', type: 'Web/Frontend' },
      workspace: { isEmpty: true, isProjectPresent: false, isMonorepo: false, hasGit: true },
      stack: {
        language: 'TypeScript',
        frontend: 'React',
        backend: null,
        database: null,
        authMethod: null,
        apiStyle: null,
        uiFramework: null,
        cssFramework: null,
        stateManagement: null,
        buildTool: 'Vite'
      },
      requirements: [],
      metadata: { length: 50, lineCount: 1, hasMarkdown: false },
      warnings: []
    },
    memories: [],
    knowledge: { indexedFiles: [], relevantSymbols: [], matchedContext: [] },
    routingDecision: {
      requestId: 'req-orch-test-001',
      selectedModel: { modelId: 'mock-coder', name: 'Mock Coder', type: 'Coding' },
      modelType: 'Coding',
      reason: 'Matched intent Web/Frontend',
      fallbackModels: [],
      metadata: { contextWindow: 4096, latencyMs: 100, capabilities: ['code'] }
    },
    kernelLogs: []
  };

  beforeEach(() => {
    orchestrator = new OrchestratorEngine();
    orchestrator.clearHistory();
  });

  it('should initialize workflow context and generate unique Session ID and Task IDs', async () => {
    const result = await orchestrator.executeWorkflow(sampleCompiledRequest);

    assert.strictEqual(result.status, 'SUCCESS');
    assert.ok(result.sessionId.startsWith('session-'));
    assert.ok(result.workflowId.startsWith('wf-'));
    assert.strictEqual(result.requestId, sampleCompiledRequest.requestId);

    const context = result.workflowContext;
    assert.ok(context);
    assert.strictEqual(context.sessionId, result.sessionId);
    assert.strictEqual(context.status, 'COMPLETED');
    assert.ok(context.taskQueue.length > 0);

    for (const task of context.taskQueue) {
      assert.ok(task.taskId.startsWith(`task-${result.sessionId}-`));
      assert.ok(task.assignedAgentId);
      assert.ok(task.priority);
    }
  });

  it('should decompose requests into prioritized tasks with assigned dependencies', async () => {
    const result = await orchestrator.executeWorkflow(sampleCompiledRequest);
    const queue = result.workflowContext.taskQueue;

    assert.strictEqual(queue.length, 11);

    // Verify task assignment to downstream agents
    const agentIds = queue.map(t => t.assignedAgentId);
    assert.ok(agentIds.includes('requirement-agent'));
    assert.ok(agentIds.includes('project-intelligence-agent'));
    assert.ok(agentIds.includes('engineering-decision-agent'));
    assert.ok(agentIds.includes('architecture-agent'));
    assert.ok(agentIds.includes('workspace-agent'));
    assert.ok(agentIds.includes('project-manifest-agent'));
    assert.ok(agentIds.includes('planner-agent'));
    assert.ok(agentIds.includes('generator-sdk-agent'));
    assert.ok(agentIds.includes('memory-agent'));
    assert.ok(agentIds.includes('executor-agent'));
    assert.ok(agentIds.includes('reviewer-agent'));

    // Task 1 must be requirement-agent, Task 7 planner-agent, Task 8 generator-sdk-agent
    assert.strictEqual(queue[0].assignedAgentId, 'requirement-agent');
    assert.strictEqual(queue[6].assignedAgentId, 'planner-agent');
    assert.strictEqual(queue[7].assignedAgentId, 'generator-sdk-agent');

    // Task 3 (Synthesis) should depend on Task 2 (Architecture)
    const task3 = queue.find(t => t.assignedAgentId === 'executor-agent');
    assert.ok(task3);
    assert.strictEqual(task3.priority, 'CRITICAL');
    assert.ok(task3.dependencies.length > 0);
  });

  it('should generate structured stage logs for all 6 orchestration stages', async () => {
    const result = await orchestrator.executeWorkflow(sampleCompiledRequest);
    const logs = result.orchestratorLogs;

    assert.ok(logs.length >= 6);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('WORKFLOW_INITIALIZED'));
    assert.ok(stages.includes('TASK_DECOMPOSITION'));
    assert.ok(stages.includes('DEPENDENCY_GRAPH_BUILT'));
    assert.ok(stages.includes('QUEUE_ENQUEUED'));
    assert.ok(stages.includes('AGENT_MANAGER_FORWARD'));
    assert.ok(stages.includes('WORKFLOW_COMPLETED'));
  });

  it('should track active workflows and support clear history', async () => {
    assert.strictEqual(orchestrator.getActiveWorkflows().length, 0);

    const result = await orchestrator.executeWorkflow(sampleCompiledRequest);

    assert.strictEqual(orchestrator.getActiveWorkflows().length, 1);
    assert.strictEqual(orchestrator.getActiveWorkflows()[0].sessionId, result.sessionId);

    orchestrator.clearHistory();
    assert.strictEqual(orchestrator.getActiveWorkflows().length, 0);
    assert.strictEqual(orchestrator.getLogs().length, 0);
  });
});

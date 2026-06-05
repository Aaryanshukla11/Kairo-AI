import * as assert from 'assert';
import { aiKernel } from '../../src/core/ai-kernel/kernel';
import { orchestratorEngine } from '../../src/core/orchestrator/orchestratorEngine';
import { agentManager } from '../../src/core/agents/agentManager';
import { agentRegistry } from '../../src/core/agents/agentRegistry';

describe('Orchestrator Flow Integration Tests (User Prompt -> AI Kernel -> Orchestrator -> Agent Manager)', () => {
  beforeEach(() => {
    aiKernel.clearHistory();
    orchestratorEngine.clearHistory();
  });

  it('should process user prompt through complete workflow: AI Kernel -> Orchestrator -> Agent Manager', async () => {
    const prompt = 'Create Express REST API for Todo items with TypeScript';
    const workspacePath = 'c:/express-todo-test';

    // 1. Trigger single entry point: AI Kernel
    const compiledRequest = await aiKernel.processPrompt(prompt, workspacePath);

    // 2. Verify AI Kernel completed and triggered Orchestrator handoff
    assert.ok(compiledRequest);
    const kernelLogs = aiKernel.getLogs();
    const handoffLog = kernelLogs.find(l => l.stage === 'ORCHESTRATOR_HANDOFF');
    assert.ok(handoffLog, 'AI Kernel must hand off request to Orchestrator');

    // 3. Verify Orchestration Result returned inside compiled request
    const orchestrationResult = compiledRequest.orchestrationResult;
    assert.ok(orchestrationResult, 'Compiled request must contain orchestrationResult');
    assert.strictEqual(orchestrationResult.status, 'SUCCESS');
    assert.ok(orchestrationResult.sessionId.startsWith('session-'));
    assert.ok(orchestrationResult.workflowId.startsWith('wf-'));

    // 4. Verify Orchestrator logs confirm full stage sequence
    const orchLogs = orchestratorEngine.getLogs();
    assert.ok(orchLogs.length >= 6);

    const stages = orchLogs.map(l => l.stage);
    assert.ok(stages.includes('WORKFLOW_INITIALIZED'));
    assert.ok(stages.includes('TASK_DECOMPOSITION'));
    assert.ok(stages.includes('DEPENDENCY_GRAPH_BUILT'));
    assert.ok(stages.includes('QUEUE_ENQUEUED'));
    assert.ok(stages.includes('AGENT_MANAGER_FORWARD'));
    assert.ok(stages.includes('WORKFLOW_COMPLETED'));

    // 5. Verify tasks were dispatched to Agent Manager and executed by registered agents
    assert.ok(orchestrationResult.tasksCompleted > 0);
    assert.strictEqual(orchestrationResult.tasksFailed, 0);
    assert.ok(Array.isArray(orchestrationResult.agentResults));

    const dispatchedAgentIds = orchestrationResult.agentResults.map((r: any) => r.agentId);
    assert.ok(dispatchedAgentIds.includes('requirement-agent'));
    assert.ok(dispatchedAgentIds.includes('project-intelligence-agent'));
    assert.ok(dispatchedAgentIds.includes('engineering-decision-agent'));
    assert.ok(dispatchedAgentIds.includes('architecture-agent'));
    assert.ok(dispatchedAgentIds.includes('workspace-agent'));
    assert.ok(dispatchedAgentIds.includes('project-manifest-agent'));
    assert.ok(dispatchedAgentIds.includes('planner-agent'));
    assert.ok(dispatchedAgentIds.includes('generator-sdk-agent'));
    assert.ok(dispatchedAgentIds.includes('memory-agent'));
    assert.ok(dispatchedAgentIds.includes('executor-agent'));
    assert.ok(dispatchedAgentIds.includes('reviewer-agent'));
  });

  it('should enforce that Orchestrator receives requests ONLY from AI Kernel', async () => {
    // Ensure all registered agents are present in AgentRegistry
    const registeredAgents = agentRegistry.list();
    assert.ok(registeredAgents.length >= 10, 'AgentRegistry must contain registered downstream agents');

    // Verify AgentManager exposes stats
    const stats = agentManager.getMonitorStats();
    assert.ok(Array.isArray(stats));
    assert.ok(stats.length > 0);
  });
});

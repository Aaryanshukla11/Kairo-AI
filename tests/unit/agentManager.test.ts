import * as assert from 'assert';
import { AgentManager } from '../../src/core/agents/agentManager';
import { agentRegistry } from '../../src/core/agents/agentRegistry';
import { AgentTask } from '../../src/core/agents/agentTypes';

describe('Agent Manager Unit Tests', () => {
  let manager: AgentManager;

  beforeEach(() => {
    manager = new AgentManager();
    manager.clearHistory();
  });

  it('should automatically log startup registration for all registered agents', () => {
    const logs = manager.getLogs();
    assert.ok(logs.length >= 10, 'Must log startup registration for default agents');

    const regLogs = logs.filter(l => l.stage === 'REGISTRATION');
    assert.ok(regLogs.length >= 10);
    assert.strictEqual(regLogs[0].status, 'SUCCESS');
    assert.ok(regLogs[0].details.agentId);
  });

  it('should support capability mapping and agent discovery', () => {
    const memoryAgents = manager.getAgentsByCapability('retrieval');
    assert.ok(memoryAgents.length > 0);

    const capMap = manager.getCapabilityMap();
    assert.ok(capMap['retrieval']);
    assert.ok(capMap['retrieval'].includes('memory-agent'));

    const foundAgent = manager.findAgentForTask('code_synthesis');
    assert.ok(foundAgent);
    assert.strictEqual(foundAgent?.id, 'executor-agent');
  });

  it('should dispatch tasks, track status transitions, and emit structured logs', async () => {
    const task: AgentTask = {
      id: 'task-mgr-001',
      title: 'Synthesize code for API',
      assignedAgentId: 'executor-agent',
      payload: { code: 'const x = 1;' },
      status: 'pending'
    };

    const result = await manager.dispatchTask(task);
    assert.ok(result);
    assert.strictEqual(task.status, 'completed');

    const logs = manager.getLogs().filter(l => l.stage !== 'REGISTRATION');
    assert.ok(logs.length >= 3);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('AGENT_SELECTION'));
    assert.ok(stages.includes('TASK_DISPATCH'));
    assert.ok(stages.includes('TASK_COMPLETED'));
  });

  it('should dispatch workflow tasks in sequential or parallel mode and return structured summary', async () => {
    const tasks: AgentTask[] = [
      {
        id: 'wf-task-1',
        title: 'Sync Memory',
        assignedAgentId: 'memory-agent',
        payload: { action: 'SYNC' },
        status: 'pending'
      },
      {
        id: 'wf-task-2',
        title: 'Verify Architecture',
        assignedAgentId: 'architecture-agent',
        payload: { action: 'VERIFY' },
        status: 'pending'
      }
    ];

    // Sequential mode
    const seqResult = await manager.dispatchWorkflowTasks(tasks);
    assert.strictEqual(seqResult.completedCount, 2);
    assert.strictEqual(seqResult.failedCount, 0);
    assert.strictEqual(seqResult.results.length, 2);

    // Parallel mode
    const parResult = await manager.dispatchWorkflowTasks(tasks, { parallel: true });
    assert.strictEqual(parResult.completedCount, 2);
    assert.strictEqual(parResult.failedCount, 0);
    assert.strictEqual(parResult.results.length, 2);
  });

  it('should handle agent dispatch failures gracefully and return structured errors', async () => {
    const invalidTask: AgentTask = {
      id: 'task-err-001',
      title: 'Invalid Agent Task',
      assignedAgentId: 'non-existent-agent',
      payload: {},
      status: 'pending'
    };

    try {
      await manager.dispatchTask(invalidTask);
    } catch (err: any) {
      assert.ok(err.message.includes('No suitable agent found'));
    }

    assert.strictEqual(invalidTask.status, 'failed');
  });
});

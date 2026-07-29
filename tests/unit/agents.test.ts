import * as assert from 'assert';
import { AgentRuntime } from '../../src/core/agents/agentRuntime';
import { agentRegistry } from '../../src/core/agents/agentRegistry';
import { agentContext } from '../../src/core/agents/agentContext';
import { agentMemory } from '../../src/core/agents/agentMemory';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { TaskAgent } from '../../src/core/agents/base/taskAgent';

describe('Agent Runtime Engine Tests', () => {
  let runtime: AgentRuntime;

  before(() => {
    runtime = new AgentRuntime();
  });

  describe('Registry & Validator', () => {
    it('should load default agents planner, executor, reviewer, workspace, retriever', () => {
      const list = agentRegistry.list();
      assert.ok(list.length >= 5);

      const planner = agentRegistry.get('planner-agent');
      assert.ok(planner);
      assert.strictEqual(planner?.definition.name, 'Planner Agent');
    });

    it('should reject duplicate id registrations', () => {
      const dupAgent = new TaskAgent({
        id: 'planner-agent',
        name: 'Duplicate Agent',
        role: 'Tester',
        version: '1.0.0',
        status: AgentStatus.Idle,
        priority: 1,
        capabilities: ['planning'],
        permissions: []
      });

      assert.throws(() => {
        agentRegistry.register(dupAgent);
      }, /Duplicate ID/);
    });
  });

  describe('Lifecycle & Task Dispatch', () => {
    it('should prepare status changes when loading or unloading agents', async () => {
      const workspaceAgent = agentRegistry.get('workspace-agent');
      assert.ok(workspaceAgent);
      
      await runtime.loadAgent('workspace-agent');
      assert.strictEqual(workspaceAgent?.status, AgentStatus.Idle);

      await runtime.unloadAgent('workspace-agent');
      assert.strictEqual(workspaceAgent?.status, AgentStatus.Stopped);
    });

    it('should dispatch tasks and report success payload and metrics', async () => {
      await runtime.loadAgent('executor-agent');
      
      const task: AgentTask = {
        id: 'task-test',
        title: 'Synthesize code block',
        assignedAgentId: 'executor-agent',
        payload: { text: 'Create mock' },
        status: 'pending'
      };

      const res = await runtime.dispatchTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.includes('Mock execution by Executor Agent'));

      const stats = runtime.getMonitorStats();
      const execStats = stats.find(s => s.id === 'executor-agent');
      assert.ok(execStats);
      assert.strictEqual(execStats?.messagesReceived, 1);
    });
  });

  describe('Context & Memory', () => {
    it('should share key values in context and remember facts history', () => {
      agentContext.set('activeProjectId', 'SASTA_ID');
      assert.strictEqual(agentContext.get('activeProjectId'), 'SASTA_ID');

      agentMemory.remember('planner-agent', 'Synthesized permissionEngine');
      const memories = agentMemory.recall('planner-agent');
      assert.strictEqual(memories[0], 'Synthesized permissionEngine');
    });
  });
});

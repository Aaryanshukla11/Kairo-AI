import * as assert from 'assert';
import { ExecutorAgent } from '../../src/core/agents/executor/executorAgent';
import { ExecutionQueue } from '../../src/core/agents/executor/executionQueue';
import { executionValidator } from '../../src/core/agents/executor/executionValidator';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Executor Agent Tests', () => {
  let agent: ExecutorAgent;

  before(() => {
    agent = new ExecutorAgent({
      id: 'executor-agent',
      name: 'Executor Agent',
      role: 'Code Synthesis & Reprocessing',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['synthesis', 'refactoring'],
      permissions: ['WRITE', 'EXECUTE']
    });
  });

  describe('Validation', () => {
    it('should reject unapproved plan execution tasks', () => {
      const plan = {
        id: 'plan-unapproved',
        goal: 'test',
        approved: false,
        tasks: []
      };

      assert.throws(() => {
        executionValidator.validateApproval(plan);
      }, /has not been approved/);
    });
  });

  describe('Queue Handling', () => {
    it('should resolve next task according to topological dependency graph', () => {
      const queue = new ExecutionQueue();
      queue.setQueue([
        {
          id: 'task-1',
          title: 'Analyze Webpack configs',
          type: 'Analyze' as any,
          description: '',
          dependencies: ['task-2'],
          affectedFiles: []
        },
        {
          id: 'task-2',
          title: 'Resolve Manifest',
          type: 'Create' as any,
          description: '',
          dependencies: [],
          affectedFiles: []
        }
      ]);

      const nextTask = queue.next();
      assert.ok(nextTask);
      assert.strictEqual(nextTask?.id, 'task-2');
    });
  });

  describe('Execution & Metrics logs', () => {
    it('should coordinate sequential approved plan execute calls and register latency', async () => {
      const plan = {
        id: 'plan-exec-1',
        goal: 'Compile manifests',
        approved: true,
        validationSummary: { valid: true, errors: [] },
        tasks: [
          {
            id: 'task-1',
            title: 'Scan config files',
            type: 'Analyze' as any,
            description: 'scan config',
            dependencies: [],
            affectedFiles: []
          }
        ]
      };

      const task = {
        id: 'task-dispatch-exec-1',
        title: 'Run approved plan',
        assignedAgentId: 'executor-agent',
        payload: { plan },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.report.completedTasks.length, 1);
      assert.strictEqual(res.metrics.runsExecutedCount, 1);
    });
  });
});

import * as assert from 'assert';
import { PlannerAgent } from '../../src/core/agents/planner/plannerAgent';
import { PlanningStrategyType, PlannerTaskType } from '../../src/core/agents/planner/plannerTypes';
import { plannerValidator } from '../../src/core/agents/planner/plannerValidator';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Planner Agent Tests', () => {
  let agent: PlannerAgent;

  before(() => {
    agent = new PlannerAgent({
      id: 'planner-agent',
      name: 'Planner Agent',
      role: 'Planning & Architect',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['planning', 'decomposition'],
      permissions: ['READ', 'WRITE']
    });
  });

  describe('Request Validations', () => {
    it('should throw error on empty request prompts', () => {
      assert.throws(() => {
        plannerValidator.validateRequest('');
      }, /cannot be empty/);
    });

    it('should throw error on impossible tasks containing bad keywords', () => {
      assert.throws(() => {
        plannerValidator.validateRequest('Fly to Mars and make a sandwich');
      }, /Impossible request/);
    });
  });

  describe('Plan Generation & Strategies', () => {
    it('should generate plan and resolve correct strategy based on prompt keyword', async () => {
      const task = {
        id: 'task-dispatch-1',
        title: 'Draft bug fix plan',
        assignedAgentId: 'planner-agent',
        payload: { text: 'Fix the index out of bounds error in file' },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.plan.strategy, PlanningStrategyType.BugFix);
      assert.ok(res.plan.tasks.length > 0);
      assert.strictEqual(res.metrics.plansGeneratedCount, 1);
    });
  });

  describe('Plan Validity checks', () => {
    it('should reject plans containing circular dependencies', () => {
      const badPlan = {
        id: 'bad-plan',
        goal: 'Bad Goal',
        summary: 'Bad summary',
        strategy: PlanningStrategyType.FeatureDevelopment,
        priority: 'high' as any,
        estimatedDurationMin: 10,
        affectedFiles: [],
        dependencies: [],
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            type: PlannerTaskType.Modify,
            description: 'desc',
            affectedFiles: [],
            dependencies: ['task-2']
          },
          {
            id: 'task-2',
            title: 'Task 2',
            type: PlannerTaskType.Modify,
            description: 'desc',
            affectedFiles: [],
            dependencies: ['task-1']
          }
        ],
        riskAssessment: {
          complexity: 'low' as any,
          riskScore: 10,
          mitigationStrategy: ''
        },
        validationSummary: {
          valid: true,
          errors: []
        }
      };

      assert.throws(() => {
        plannerValidator.validatePlan(badPlan);
      }, /Circular dependencies/);
    });
  });
});

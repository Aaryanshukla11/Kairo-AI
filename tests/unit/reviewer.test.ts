import * as assert from 'assert';
import { ReviewerAgent } from '../../src/core/agents/reviewer/reviewerAgent';
import { RiskLevel } from '../../src/core/agents/reviewer/reviewerTypes';
import { reviewValidator } from '../../src/core/agents/reviewer/reviewValidator';
import { reviewRules } from '../../src/core/agents/reviewer/reviewRules';
import { reviewScorer } from '../../src/core/agents/reviewer/reviewScorer';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Reviewer Agent Tests', () => {
  let agent: ReviewerAgent;

  before(() => {
    agent = new ReviewerAgent({
      id: 'reviewer-agent',
      name: 'Reviewer Agent',
      role: 'Quality Assurance & ArchReview',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 6,
      capabilities: ['reviewing', 'validation'],
      permissions: ['READ']
    });
  });

  describe('Validation', () => {
    it('should throw validation error on missing dependent tasks IDs in plan graph', () => {
      const plan = {
        id: 'plan-1',
        goal: 'test',
        tasks: [
          {
            id: 'task-1',
            title: 'T1',
            type: 'Create' as any,
            description: '',
            dependencies: ['non-existent-task'],
            affectedFiles: []
          }
        ]
      } as any;

      assert.throws(() => {
        reviewValidator.validatePlan(plan);
      }, /references missing dependency/);
    });
  });

  describe('Scoring & Violations', () => {
    it('should identify unsafe deletions and compute high risk score weights', () => {
      const plan = {
        id: 'plan-2',
        goal: 'test deletes',
        tasks: [
          {
            id: 'task-1',
            title: 'Delete legacy controllers files',
            type: 'Delete' as any,
            description: 'unsafe clear',
            dependencies: [],
            affectedFiles: []
          }
        ],
        affectedFiles: []
      } as any;

      const issues = reviewRules.evaluate(plan);
      assert.strictEqual(issues.length, 1);
      assert.strictEqual(issues[0].type, 'UnsafeFileDeletion');

      const scores = reviewScorer.calculateScores(issues);
      assert.strictEqual(scores.riskLevel, RiskLevel.Medium);
      assert.strictEqual(scores.riskScore, 40);
    });
  });

  describe('Review execution and metrics logs', () => {
    it('should complete plan reviews and increment cumulative score averages', async () => {
      const plan = {
        id: 'plan-3',
        goal: 'Clean workspace modules',
        strategy: 'Refactoring' as any,
        tasks: [
          {
            id: 'task-1',
            title: 'Refactor indexes barrel',
            type: 'Refactor' as any,
            description: 'desc',
            dependencies: [],
            affectedFiles: []
          }
        ],
        affectedFiles: ['src/index.ts']
      } as any;

      const task = {
        id: 'task-dispatch-review-1',
        title: 'Review Clean workspace modules plan',
        assignedAgentId: 'reviewer-agent',
        payload: { plan },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.report.overallScore > 0);
      assert.strictEqual(res.metrics.reviewsCount, 1);
    });
  });
});

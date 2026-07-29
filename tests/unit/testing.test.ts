import * as assert from 'assert';
import { TestingAgent } from '../../src/core/agents/testing/testingAgent';
import { RiskLevel, TestType } from '../../src/core/agents/testing/testingTypes';
import { testingValidator } from '../../src/core/agents/testing/testingValidator';
import { testingStrategies } from '../../src/core/agents/testing/testingStrategies';
import { testingCoverage } from '../../src/core/agents/testing/testingCoverage';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Testing Agent Tests', () => {
  let agent: TestingAgent;

  before(() => {
    agent = new TestingAgent({
      id: 'testing-agent',
      name: 'Testing Agent',
      role: 'Quality Assurance & Test runner',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 7,
      capabilities: ['testing', 'regression'],
      permissions: ['READ', 'EXECUTE']
    });
  });

  describe('Validation Checks', () => {
    it('should reject execution report missing properties', () => {
      assert.throws(() => {
        testingValidator.validateRequest({} as any, [{ name: 'test' }] as any);
      }, /Missing execution report input/);

      assert.throws(() => {
        testingValidator.validateRequest({ executionId: '' } as any, [{ name: 'test' }] as any);
      }, /Invalid execution report content/);
    });

    it('should reject empty or missing workspace folders', () => {
      assert.throws(() => {
        testingValidator.validateRequest({ executionId: '1', planId: '1' } as any, undefined);
      }, /Invalid workspace folder/);
    });

    it('should reject unsupported frameworks', () => {
      assert.throws(() => {
        testingValidator.validateFramework('unknown-framework');
      }, /Unknown or unsupported testing framework/);
    });
  });

  describe('Testing Strategy & Risk Evaluation', () => {
    it('should resolve minimal risk level if no files are changed', () => {
      const risk = testingStrategies.determineRiskLevel([]);
      assert.strictEqual(risk, RiskLevel.Minimal);
    });

    it('should evaluate critical risk level on security files changes', () => {
      const risk = testingStrategies.determineRiskLevel(['src/core/permission/permissionService.ts']);
      assert.strictEqual(risk, RiskLevel.Critical);
      
      const types = testingStrategies.recommendTestTypes(risk);
      assert.ok(types.includes(TestType.Regression));
    });

    it('should recommend unit and smoke tests for UI changes', () => {
      const risk = testingStrategies.determineRiskLevel(['src/webview/App.tsx']);
      assert.strictEqual(risk, RiskLevel.Medium);
      
      const types = testingStrategies.recommendTestTypes(risk);
      assert.ok(types.includes(TestType.Smoke));
      assert.ok(types.includes(TestType.Accessibility));
    });
  });

  describe('Coverage & Confidence Metric Score calculations', () => {
    it('should compute logical coverage estimation percentages', () => {
      const plan = {
        planId: 'plan-1',
        strategy: 'test',
        riskLevel: RiskLevel.Medium,
        testTypes: [TestType.Unit],
        affectedModules: ['src/core'],
        targetPaths: ['tests/unit/test1.ts', 'tests/unit/test2.ts']
      };
      
      const coverage = testingCoverage.estimate(plan);
      assert.ok(coverage >= 74 && coverage <= 100);
    });

    it('should execute workflows successfully and collect results summaries', async () => {
      const mockExecutionReport = {
        executionId: 'exec-1',
        planId: 'plan-1',
        completedTasks: ['task-1'],
        skippedTasks: [],
        failedTasks: [],
        executionTimeMs: 120,
        toolUsage: [],
        generatedArtifacts: ['src/core/agents/testing/testingAgent.ts'],
        logs: []
      };

      const task = {
        id: 'task-dispatch-testing-1',
        title: 'Run test workflow',
        assignedAgentId: 'testing-agent',
        payload: {
          action: 'RUN_WORKFLOW',
          executionReport: mockExecutionReport,
          framework: 'simulated'
        },
        status: 'pending' as any
      };

      // Mock vscode workspaceFolders mapping
      const workspaceBackup = require('vscode').workspace;
      Object.defineProperty(workspaceBackup, 'workspaceFolders', {
        get: () => [{ name: 'SASTA ANTIGRAVITY' }],
        configurable: true
      });

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.testingId.startsWith('test-run-'));
      assert.ok(res.result.report.confidenceScore > 0);
      assert.strictEqual(res.metrics.runsCount, 1);
    });
  });
});

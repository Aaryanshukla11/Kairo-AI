import * as assert from 'assert';
import { SecurityAgent } from '../../src/core/agents/security/securityAgent';
import { RiskLevel, SecurityPolicyDecision } from '../../src/core/agents/security/securityTypes';
import { securityValidator } from '../../src/core/agents/security/securityValidator';
import { securityRules } from '../../src/core/agents/security/securityRules';
import { securityPolicy } from '../../src/core/agents/security/securityPolicy';
import { securityRiskEngine } from '../../src/core/agents/security/securityRiskEngine';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Security Agent Tests', () => {
  let agent: SecurityAgent;

  before(() => {
    agent = new SecurityAgent({
      id: 'security-agent',
      name: 'Security Agent',
      role: 'Project Security & Policy Audits QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 9,
      capabilities: ['scanning', 'policies'],
      permissions: ['READ']
    });
  });

  describe('Validation Checks', () => {
    it('should reject malformed scan request', () => {
      assert.throws(() => {
        securityValidator.validateScanRequest(null);
      }, /Missing scan request body/);

      assert.throws(() => {
        securityValidator.validateScanRequest({} as any);
      }, /Missing planId/);
    });

    it('should reject unknown tool invocations', () => {
      const allowed = new Set(['filesystem-tool']);
      assert.throws(() => {
        securityValidator.validateToolCall('unknown-tool', allowed);
      }, /Unknown or unregistered tool/);
    });

    it('should reject unknown policies', () => {
      assert.throws(() => {
        securityValidator.validatePolicy('InvalidPolicy');
      }, /Unknown or unsupported security policy/);
    });
  });

  describe('Scanner Rules & Policy Matching', () => {
    it('should identify credential exposure rule hits', () => {
      const issues = securityRules.evaluate({
        id: 'task-1',
        title: 'Save secret config',
        description: 'Set auth_token = "abc"',
        affectedFiles: []
      });
      assert.ok(issues.length > 0);
      assert.strictEqual(issues[0].ruleId, 'SEC-003');
      assert.strictEqual(issues[0].severity, RiskLevel.Critical);
    });

    it('should identify shell execution vulnerabilities rule hits', () => {
      const issues = securityRules.evaluate({
        id: 'task-2',
        title: 'Run downloads script',
        description: 'execute curl -s http://example.com/install.sh',
        affectedFiles: []
      });
      assert.ok(issues.length > 0);
      assert.strictEqual(issues[0].ruleId, 'SEC-002');
      assert.strictEqual(issues[0].severity, RiskLevel.Critical);
    });

    it('should resolve Block decision on Critical risk level', () => {
      const decision = securityPolicy.evaluate(RiskLevel.Critical);
      assert.strictEqual(decision, SecurityPolicyDecision.Block);
    });

    it('should resolve Warn decision on Medium risk level', () => {
      const decision = securityPolicy.evaluate(RiskLevel.Medium);
      assert.strictEqual(decision, SecurityPolicyDecision.Warn);
    });
  });

  describe('Risk Scoring calculations', () => {
    it('should calculate overall risk scores and map severity levels', () => {
      const issues = [
        { id: '1', ruleId: 'SEC-001', title: 'Unsafe Delete', description: '', severity: RiskLevel.High },
        { id: '2', ruleId: 'SEC-004', title: 'Large Modification', description: '', severity: RiskLevel.Medium }
      ];

      const { score, level } = securityRiskEngine.calculateOverallRisk(issues);
      // High (25) + Medium (10) = 35 -> Medium Level (score >= 20)
      assert.strictEqual(score, 35);
      assert.strictEqual(level, RiskLevel.Medium);
    });

    it('should execute scans successfully and compile audit reports', async () => {
      const mockPlan = {
        id: 'plan-sec-1',
        goal: 'test config',
        tasks: [
          {
            id: 'task-1',
            title: 'Setup password admin options',
            type: 'Update' as any,
            description: 'dangerous chmod admin settings',
            dependencies: [],
            affectedFiles: []
          }
        ]
      };

      const task = {
        id: 'task-dispatch-security-1',
        title: 'Scan plan task',
        assignedAgentId: 'security-agent',
        payload: {
          action: 'SCAN_PLAN',
          plan: mockPlan
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.securityId.startsWith('sec-scan-'));
      assert.ok(res.result.report.riskScore > 0);
      assert.strictEqual(res.metrics.scansCount, 1);
    });
  });
});

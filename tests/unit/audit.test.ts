import * as assert from 'assert';
import { auditEngine } from '../../src/core/audit/auditEngine';

describe('Execution Audit Engine (M03-S03-T008) Tests', () => {
  beforeEach(() => {
    auditEngine.clear();
  });

  it('should log execution details into audit trail logs', () => {
    const report = auditEngine.logExecution({
      decision: 'Allow',
      risk: { overallRiskScore: 10 },
      simulation: { success: true },
      validation: { valid: true },
      review: {},
      approval: { granted: true, requiredLevel: 'Automatic' },
      patch: 'const a = 1;',
      rollback: {},
      timingMs: 15,
      agentChain: ['SafeEditEngine']
    });

    assert.ok(report.auditId);
    assert.strictEqual(report.decision, 'Allow');
    assert.strictEqual(auditEngine.getHistory().length, 1);
  });
});

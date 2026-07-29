import * as assert from 'assert';
import { policyDecisionEngine } from '../../src/core/policyDecision/policyDecisionEngine';
import { RiskGraphData } from '../../src/core/safeEdit/riskGraph/riskTypes';
import { ExecutionContext } from '../../src/core/safeEdit/executionContext/executionContextTypes';

describe('Policy Decision Engine (M03-S03-T009) Tests', () => {
  const mockRisk: RiskGraphData = {
    categories: {} as any,
    overallRiskScore: 10,
    overallRiskLevel: 'Minimal',
    overallConfidence: 0.95
  };

  const mockCtx: ExecutionContext = {
    workspaceStatus: 'clean',
    gitStatus: 'clean',
    currentBranch: 'main',
    uncommittedChanges: 0,
    activeEditors: [],
    lockedFiles: [],
    backgroundTasks: [],
    runningTerminalCommands: [],
    os: 'win32',
    diskSpace: { free: 50, total: 100 },
    memory: { free: 8, total: 16 },
    cpuLoad: 0.1,
    workspaceSnapshotId: 'snap-1',
    currentUser: 'test',
    executionTimestamp: Date.now()
  };

  it('should allow execution under clean context and minimal risk', () => {
    const report = policyDecisionEngine.decide({
      riskGraph: mockRisk,
      approval: true,
      workspaceContext: mockCtx
    });
    assert.strictEqual(report.decision, 'Allow');
    assert.strictEqual(report.violations.length, 0);
  });

  it('should block execution under critical risk', () => {
    const criticalRisk: RiskGraphData = {
      ...mockRisk,
      overallRiskScore: 90,
      overallRiskLevel: 'Critical'
    };
    const report = policyDecisionEngine.decide({
      riskGraph: criticalRisk,
      approval: true,
      workspaceContext: mockCtx
    });
    assert.strictEqual(report.decision, 'Block');
    assert.ok(report.violations.length > 0);
  });
});

import * as assert from 'assert';
import { safeEditEngine } from '../../src/core/safeEdit/safeEditEngine';
import { riskEvaluator } from '../../src/core/safeEdit/riskEvaluator';
import { approvalCoordinator } from '../../src/core/safeEdit/approvalCoordinator';
import { rollbackPlanner } from '../../src/core/safeEdit/rollbackPlanner';
import { policyEvaluator } from '../../src/core/safeEdit/policyEvaluator';
import { safetyAnalyzer } from '../../src/core/safeEdit/safetyAnalyzer';

describe('Safe Edit Engine Tests', () => {
  describe('Risk Evaluator', () => {
    it('should evaluate minimal risk for safe content', () => {
      const result = riskEvaluator.calculateRisk({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;'
      });
      assert.strictEqual(result.level, 'Minimal');
      assert.ok(result.score <= 20);
    });

    it('should evaluate low/medium risk when modification contains critical files/operations', () => {
      const result = riskEvaluator.calculateRisk({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'fs.writeFileSync("test.txt", "content");'
      });
      assert.ok(result.score > 20);
    });
  });

  describe('Approval Coordinator', () => {
    it('should pass approval verification when userApproved is true', () => {
      const result = approvalCoordinator.verifyApproval({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;',
        userApproved: true
      });
      assert.strictEqual(result.approved, true);
      assert.strictEqual(result.blocking.length, 0);
    });

    it('should return blocking issue when userApproved is false', () => {
      const result = approvalCoordinator.verifyApproval({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;',
        userApproved: false
      });
      assert.strictEqual(result.approved, false);
      assert.ok(result.blocking.length > 0);
    });
  });

  describe('Rollback Planner', () => {
    it('should verify rollback readiness when targetFile is specified', () => {
      const result = rollbackPlanner.verifyRollbackReadiness({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;'
      });
      assert.strictEqual(result.ready, true);
      assert.strictEqual(result.blocking.length, 0);
    });

    it('should return blocking issue when targetFile is empty', () => {
      const result = rollbackPlanner.verifyRollbackReadiness({
        targetFile: '',
        patchContent: 'const a = 1;'
      });
      assert.strictEqual(result.ready, false);
      assert.ok(result.blocking.length > 0);
    });
  });

  describe('Policy Evaluator', () => {
    it('should block direct dependency modifications', () => {
      const result = policyEvaluator.evaluatePolicies({
        targetFile: 'package.json',
        patchContent: '"dependencies": { "express": "^4.17.1" }'
      });
      assert.ok(result.blocking.includes('POLICY-01: Direct dependencies modification attempts blocked'));
    });
  });

  describe('Safety Analyzer & Strategies', () => {
    it('should warn when target file is outside standard workspace directories', () => {
      const result = safetyAnalyzer.analyze({
        targetFile: '../../tmp/dangerous.ts',
        patchContent: 'const a = 1;'
      });
      assert.ok(result.warnings.some(w => w.includes('WORKSPACE-01')));
    });

    it('should block unsafe filesystem operations like rm -rf', () => {
      const result = safetyAnalyzer.analyze({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'rm -rf /'
      });
      assert.ok(result.blockingIssues.some(b => b.includes('FS-01')));
    });

    it('should block unsafe dependency changes in package.json', () => {
      const result = safetyAnalyzer.analyze({
        targetFile: 'package.json',
        patchContent: '"dependencies": { "lodash": "^4.17.21" }'
      });
      assert.ok(result.blockingIssues.some(b => b.includes('DEP-01')));
    });

    it('should block layer boundary violations where non-webview imports webview', () => {
      const result = safetyAnalyzer.analyze({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'import { App } from "../webview/App";'
      });
      assert.ok(result.blockingIssues.some(b => b.includes('ARCH-03')));
    });
  });

  describe('Safe Edit Engine Pipeline', () => {
    it('should compile a complete SafeEditReport', async () => {
      const report = await safeEditEngine.evaluate({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;',
        userApproved: true
      });
      assert.strictEqual(report.executionStatus, 'Approved');
      assert.strictEqual(report.approvalStatus, true);
      assert.strictEqual(report.rollbackReadiness, true);
      assert.strictEqual(report.blockingIssues.length, 0);
    });

    it('should set status to Rejected when blocking issues occur', async () => {
      const report = await safeEditEngine.evaluate({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'fs.unlink("/etc/passwd")',
        userApproved: true
      });
      assert.strictEqual(report.executionStatus, 'Rejected');
      assert.ok(report.blockingIssues.length > 0);
    });
  });
});

import * as assert from 'assert';
import { executionContextEngine } from '../../src/core/safeEdit/executionContext/executionContextEngine';
import { riskGraph } from '../../src/core/safeEdit/riskGraph/riskGraph';
import { safetyProviderRegistry } from '../../src/core/safeEdit/providers';
import { ruleExecutor } from '../../src/core/safeEdit/rules/ruleExecutor';
import { approvalEngine } from '../../src/core/safeEdit/approval/approvalEngine';
import { confidenceEngine } from '../../src/core/safeEdit/confidence/confidenceEngine';
import { simulationEngine } from '../../src/core/safeEdit/simulation/simulationEngine';

describe('Safe Edit Enhancements (M03-S03-T005) Tests', () => {
  describe('Execution Context Engine', () => {
    it('should retrieve OS, CPU load, user and timestamp details', async () => {
      const ctx = await executionContextEngine.getContext();
      assert.ok(ctx.os);
      assert.ok(ctx.currentUser);
      assert.ok(ctx.executionTimestamp > 0);
    });
  });

  describe('Risk Graph', () => {
    it('should compute multidimensional risk categories and aggregate them', () => {
      const report = riskGraph.compute({
        targetFile: 'src/core/dummy.ts',
        patchContent: 'const a = 1;'
      });
      assert.ok(report.categories.filesystem);
      assert.ok(report.categories.dependency);
      assert.ok(report.categories.security);
      assert.ok(report.overallRiskScore >= 0);
    });
  });

  describe('Safety Provider System', () => {
    it('should list safety providers and calculate filesystem risk', () => {
      const list = safetyProviderRegistry.list();
      assert.ok(list.length >= 5);
      const fsProv = safetyProviderRegistry.get('FilesystemSafetyProvider');
      assert.ok(fsProv);
      const risk = fsProv.risk({ targetFile: 'src/core/dummy.ts', patchContent: 'rm -rf /' });
      assert.strictEqual(risk, 90);
    });
  });

  describe('Safety Rule Registry', () => {
    it('should execute default safety rules (SAFE-001 - SAFE-004)', () => {
      const res = ruleExecutor.execute('const password = "admin";', { targetFile: 'src/core/dummy.ts' });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('SAFE-004')));
    });
  });

  describe('Approval Engine', () => {
    it('should resolve required approval level in matrix', () => {
      const res = approvalEngine.resolveApproval('Feature', 'Critical', true);
      assert.strictEqual(res.requiredLevel, 'Administrator');
      assert.strictEqual(res.granted, true);
    });
  });

  describe('Confidence Engine', () => {
    it('should calculate grade and alignment evidence', () => {
      const res = confidenceEngine.calculate({ targetFile: 'src/core/dummy.ts', patchContent: 'const a = 1;' });
      assert.ok(res.overallConfidence > 0);
      assert.ok(res.grade);
    });
  });

  describe('Simulation Engine', () => {
    it('should run in-memory virtual workspace dry run and report outcomes', async () => {
      const res = await simulationEngine.simulate('src/core/base.ts', 'const x = 1;');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.dryRunReport.clonedFilesCount, 2);
    });
  });
});

import * as assert from 'assert';
import { validationRules } from '../../src/core/validation/validationRules';
import { validationScorer } from '../../src/core/validation/validationScorer';
import { diagnosticsCollector } from '../../src/core/validation/diagnosticsCollector';
import { validationReporter } from '../../src/core/validation/validationReporter';
import { validationEngine } from '../../src/core/validation/validationEngine';

describe('Validation Engine Tests', () => {
  describe('Rule checks & Scorers', () => {
    it('should identify blocking security issues', () => {
      const issues = validationRules.execute('const val = eval("1+1");\n');
      assert.strictEqual(issues.length, 1);
      assert.strictEqual(issues[0].isBlocking, true);
    });

    it('should drop score to 0 on blocking issue', () => {
      const issues = [
        { ruleId: 'V1', message: 'blocking', isBlocking: true, category: 'Security' as const }
      ];
      const score = validationScorer.calculateScore(issues);
      assert.strictEqual(score, 0);
    });

    it('should deduct points on warnings', () => {
      const issues = [
        { ruleId: 'V1', message: 'warning', isBlocking: false, category: 'Policy' as const }
      ];
      const score = validationScorer.calculateScore(issues);
      assert.strictEqual(score, 85);
    });
  });

  describe('Diagnostics & Compiler', () => {
    it('should filter blocking vs warnings', () => {
      const issues = [
        { ruleId: 'V1', message: 'blocking', isBlocking: true, category: 'Security' as const },
        { ruleId: 'V2', message: 'warning', isBlocking: false, category: 'Policy' as const }
      ];
      const { blocking, warnings } = diagnosticsCollector.collect(issues);
      assert.strictEqual(blocking.length, 1);
      assert.strictEqual(warnings.length, 1);
    });

    it('should compile report status successfully', () => {
      const report = validationReporter.compileReport(
        'V-101',
        100,
        ['VAL-001'],
        [],
        [],
        []
      );
      assert.strictEqual(report.overallStatus, 'Passed');
      assert.strictEqual(report.validationScore, 100);
    });
  });

  describe('Pipeline Orchestrator', () => {
    it('should execute full validation report compilation', async () => {
      const report = await validationEngine.validate('src/core/base.ts', 'class BaseComponent {}');
      assert.strictEqual(report.overallStatus, 'Passed');
      assert.strictEqual(report.validationScore, 100);
    });
  });
});

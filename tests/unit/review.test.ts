import * as assert from 'assert';
import { reviewRules } from '../../src/core/review/reviewRules';
import { reviewScorer } from '../../src/core/review/reviewScorer';
import { issueCollector } from '../../src/core/review/issueCollector';
import { recommendationEngine } from '../../src/core/review/recommendationEngine';
import { reviewValidator } from '../../src/core/review/reviewValidator';
import { reviewEngine } from '../../src/core/review/reviewEngine';

describe('Self Review Engine Tests', () => {
  describe('Rule checker & Scorers checks', () => {
    it('should collect rules issues from text content', () => {
      const issues = reviewRules.execute('// TODO: fix this\nconst x = "any";\n');
      assert.strictEqual(issues.length, 2);
      assert.strictEqual(issues[0].ruleId, 'REV-001');
    });

    it('should subtract scores based on severity weights', () => {
      const issues = [
        { ruleId: 'R1', message: 'msg', severity: 'Suggestion' as const, category: 'Naming' },
        { ruleId: 'R2', message: 'msg', severity: 'Warning' as const, category: 'Naming' }
      ];
      const score = reviewScorer.calculateScore(issues);
      assert.strictEqual(score, 88); // 100 - 2 - 10
    });
  });

  describe('Recommendations & Validator checks', () => {
    it('should split issues counts', () => {
      const issues = [
        { ruleId: 'R1', message: 'warning', severity: 'Warning' as const, category: 'Naming' },
        { ruleId: 'R2', message: 'error', severity: 'Error' as const, category: 'Naming' }
      ];
      const { warnings, failedChecks } = issueCollector.collectIssues(issues);
      assert.strictEqual(warnings.length, 1);
      assert.strictEqual(failedChecks.length, 1);
    });

    it('should suggest guidelines matching rule ID', () => {
      const issues = [{ ruleId: 'REV-001', message: 'todo', severity: 'Suggestion' as const, category: 'Naming' }];
      const recs = recommendationEngine.generateRecommendations(issues);
      assert.strictEqual(recs[0], 'Replace temporary TODO items with proper handler actions.');
    });

    it('should block validation on Critical issues severity', () => {
      const issues = [{ ruleId: 'R1', message: 'critical error', severity: 'Critical' as const, category: 'Naming' }];
      assert.throws(() => {
        reviewValidator.validate(issues);
      }, /Critical issue caught/);
    });
  });

  describe('Pipeline Orchestrator', () => {
    it('should compile complete review report', async () => {
      const report = await reviewEngine.runReview('src/core/base.ts', 'class BaseComponent {}');
      assert.strictEqual(report.overallScore, 100);
      assert.strictEqual(report.riskLevel, 'low');
    });
  });
});

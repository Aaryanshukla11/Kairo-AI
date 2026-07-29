import * as assert from 'assert';
import { conventionValidator } from '../../src/core/codeGeneration/conventions/conventionValidator';
import { conventionDetector } from '../../src/core/codeGeneration/conventions/conventionDetector';
import { conventionScorer } from '../../src/core/codeGeneration/conventions/conventionScorer';
import { conventionCache } from '../../src/core/codeGeneration/conventions/conventionCache';
import { typescriptRules } from '../../src/core/codeGeneration/conventions/ruleProviders/typescriptRules';
import { reactRules } from '../../src/core/codeGeneration/conventions/ruleProviders/reactRules';
import { nodeRules } from '../../src/core/codeGeneration/conventions/ruleProviders/nodeRules';
import { conventionAnalyzer } from '../../src/core/codeGeneration/conventions/conventionAnalyzer';

describe('Project Convention Engine Tests', () => {
  describe('Validator Limits & Rule Cache', () => {
    it('should throw an error when files sample count is less than 2', () => {
      assert.throws(() => {
        conventionValidator.validateSamplesCount(1);
      }, /Insufficient representative samples/);
    });

    it('should hold and clear cached profiles in memory caches', () => {
      const mockProfile: any = { projectId: 'project-1', confidence: 0.85 };
      conventionCache.set(mockProfile);
      assert.deepStrictEqual(conventionCache.get(), mockProfile);

      conventionCache.clear();
      assert.strictEqual(conventionCache.get(), null);
    });
  });

  describe('Casing Detectors and Rules Providers checks', () => {
    it('should classify casings correctly based on string styles', () => {
      assert.strictEqual(conventionDetector.detectCasing('camelCaseText'), 'camelCase');
      assert.strictEqual(conventionDetector.detectCasing('snake_case_text'), 'snakeCase');
      assert.strictEqual(conventionDetector.detectCasing('PascalCaseText'), 'PascalCase');
    });

    it('should match target types in specific Rules Providers', () => {
      assert.strictEqual(typescriptRules.checkRule('service.ts'), true);
      assert.strictEqual(typescriptRules.checkRule('style.css'), false);

      assert.strictEqual(reactRules.checkRule('useAgentHook.ts'), true);
      assert.strictEqual(nodeRules.checkRule('require("./base")'), true);
    });

    it('should score patterns frequency consistency correctly', () => {
      const score = conventionScorer.calculateConfidence(8, 10);
      assert.strictEqual(score, 0.8);
    });
  });

  describe('Conventions Analysis Coordination', () => {
    it('should scan files list compile convention profile', () => {
      const files = [
        { path: 'src/core/baseController.ts', content: 'export class BaseController {}' },
        { path: 'src/core/agentController.ts', content: 'export class AgentController {}' },
        { path: 'src/core/viewController.ts', content: 'export class ViewController {}' }
      ];

      const profile = conventionAnalyzer.analyze(files);
      assert.ok(profile.projectId.startsWith('project-conv-'));
      assert.strictEqual(profile.namingRules.casing, 'camelCase');
      assert.strictEqual(profile.confidence, 1.0);
    });
  });
});

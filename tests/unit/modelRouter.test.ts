import * as assert from 'assert';
import { modelRouter } from '../../src/core/modelRouter/modelRouter';
import { capabilityMatcher } from '../../src/core/modelRouter/capabilityMatcher';
import { resourceAnalyzer } from '../../src/core/modelRouter/resourceAnalyzer';
import { fallbackManager } from '../../src/core/modelRouter/fallbackManager';
import { modelScorer } from '../../src/core/modelRouter/modelScorer';
import { ModelCapability } from '../../src/core/modelRegistry/registryTypes';
import { RouterTaskType, FallbackStrategy } from '../../src/core/modelRouter/routingTypes';

describe('Multi-Model Router Tests', () => {
  describe('Capability Matcher', () => {
    it('should match empty requirements successfully', () => {
      const matchResult = capabilityMatcher.match([ModelCapability.Chat], []);
      assert.strictEqual(matchResult.match, true);
      assert.strictEqual(matchResult.score, 1.0);
    });

    it('should calculate ratios of matched capabilities', () => {
      const model = [ModelCapability.CodeGeneration, ModelCapability.ToolCalling];
      const required = [ModelCapability.CodeGeneration, ModelCapability.Reasoning];
      const matchResult = capabilityMatcher.match(model, required);
      assert.strictEqual(matchResult.match, false);
      assert.strictEqual(matchResult.score, 0.5);
    });
  });

  describe('Resource Validation', () => {
    it('should reject models requiring more RAM than available', () => {
      const validation = resourceAnalyzer.validateResources(32, 16);
      assert.strictEqual(validation.ok, false);
      assert.ok(validation.reason?.includes('Insufficient System RAM'));
    });

    it('should pass models within RAM margins', () => {
      const validation = resourceAnalyzer.validateResources(8, 16);
      assert.strictEqual(validation.ok, true);
      assert.ok(validation.score >= 0.8);
    });
  });

  describe('Model Scorer', () => {
    it('should combine capabilities, resources, and speed factors', () => {
      const score = modelScorer.calculateScore(1.0, 0.8, 30);
      assert.strictEqual(score, 0.86); // (1.0*0.5)+(0.8*0.3)+(0.6*0.2)
    });
  });

  describe('Fallback Managers', () => {
    it('should resolve fallback next best candidates', () => {
      const selected = fallbackManager.resolveFallback('qwen-2.5-7b-coder', ['qwen-2.5-7b-coder', 'llama-3-8b-instruct'], FallbackStrategy.NextBestModel);
      assert.strictEqual(selected, 'llama-3-8b-instruct');
    });
  });

  describe('Router Pipeline Resolve', () => {
    it('should resolve routing decision report successfully', async () => {
      const decision = await modelRouter.route({
        requestId: 'req-r1',
        taskType: RouterTaskType.CodeGeneration,
        requiredCapabilities: [ModelCapability.CodeGeneration],
        priority: 'normal'
      });

      assert.strictEqual(decision.selectedModelId, 'qwen-2.5-7b-coder');
      assert.ok(decision.confidence > 0.5);
      assert.ok(decision.alternatives.length > 0);
    });
  });
});

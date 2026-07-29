import * as assert from 'assert';
import { patchReducer } from '../../src/core/patchOptimization/patchReducer';
import { patchMerger } from '../../src/core/patchOptimization/patchMerger';
import { conflictPredictor } from '../../src/core/patchOptimization/conflictPredictor';
import { optimizationValidator } from '../../src/core/patchOptimization/optimizationValidator';
import { patchOptimizationEngine } from '../../src/core/patchOptimization/patchOptimizationEngine';

describe('Patch Optimization Engine Tests', () => {
  describe('Reducer, Merger & Predictor checks', () => {
    it('should delete redundant empty replace ops', () => {
      const ops = [
        { lineStart: 1, lineEnd: 2, content: ' ', type: 'replace' as const }
      ];
      const { reduced, removed } = patchReducer.reduce(ops);
      assert.strictEqual(reduced.length, 0);
      assert.strictEqual(removed.length, 1);
    });

    it('should merge contiguous insert operation content', () => {
      const ops = [
        { lineStart: 1, lineEnd: 1, content: 'x = 1', type: 'insert' as const },
        { lineStart: 1, lineEnd: 1, content: 'y = 2', type: 'insert' as const }
      ];
      const { merged, mergedLogs } = patchMerger.merge(ops);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0].content, 'x = 1\ny = 2');
      assert.strictEqual(mergedLogs.length, 1);
    });

    it('should calculate conflict risk based on operations count', () => {
      const lowRisk = conflictPredictor.predictRisk([]);
      const medRisk = conflictPredictor.predictRisk([
        { lineStart: 1, lineEnd: 1, content: '', type: 'insert' as const },
        { lineStart: 2, lineEnd: 2, content: '', type: 'insert' as const },
        { lineStart: 3, lineEnd: 3, content: '', type: 'insert' as const }
      ]);
      assert.strictEqual(lowRisk, 'low');
      assert.strictEqual(medRisk, 'medium');
    });
  });

  describe('Validator & Pipeline checks', () => {
    it('should throw error on overlapping lines ranges', () => {
      const ops = [
        { lineStart: 10, lineEnd: 10, content: '', type: 'insert' as const },
        { lineStart: 10, lineEnd: 10, content: '', type: 'insert' as const }
      ];
      assert.throws(() => {
        optimizationValidator.validate(ops);
      }, /Overlapping edit operations/);
    });

    it('should run full optimization pipeline successfully', async () => {
      const patch = '--- a/test.ts\n+++ b/test.ts\n+const a = 1;\n+const b = 2;\n';
      const report = await patchOptimizationEngine.optimizePatch('src/test.ts', patch);
      assert.strictEqual(report.originalPatchSize, patch.length);
      assert.strictEqual(report.predictedMergeRisk, 'low');
    });
  });
});

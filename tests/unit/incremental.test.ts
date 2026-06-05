import * as assert from 'assert';
import { editValidator } from '../../src/core/codeGeneration/incremental/editValidator';
import { editRegionDetector } from '../../src/core/codeGeneration/incremental/editRegionDetector';
import { conflictDetector } from '../../src/core/codeGeneration/incremental/conflictDetector';
import { preservationEngine } from '../../src/core/codeGeneration/incremental/preservationEngine';
import { editOptimizer } from '../../src/core/codeGeneration/incremental/editOptimizer';
import { editPlanner } from '../../src/core/codeGeneration/incremental/editPlanner';

describe('Incremental Edit Engine Tests', () => {
  describe('Patch size validation and rewrites', () => {
    it('should throw an error when total edit bytes exceeds 90% of original file length', () => {
      const ops = [
        { type: 'replace' as const, range: { start: 0, end: 95 }, text: 'replaced' }
      ];
      assert.throws(() => {
        editValidator.validate(ops, 100);
      }, /Whole-file rewrites are prohibited/);
    });

    it('should pass validation when edit bytes are small', () => {
      const ops = [
        { type: 'replace' as const, range: { start: 10, end: 20 }, text: 'short text' }
      ];
      assert.doesNotThrow(() => {
        editValidator.validate(ops, 100);
      });
    });
  });

  describe('Conflict detections & regions matchers', () => {
    it('should flag conflict warnings for overlapping edit intervals', () => {
      const ops = [
        { type: 'insert' as const, range: { start: 10, end: 30 }, text: 'a' },
        { type: 'replace' as const, range: { start: 25, end: 40 }, text: 'b' }
      ];
      const warnings = conflictDetector.detectConflicts(ops);
      assert.strictEqual(warnings.length, 1);
      assert.ok(warnings[0].includes('Overlapping edit regions'));
    });

    it('should detect offset coordinates for matched strings keywords', () => {
      const content = 'export class Handler {}';
      const range = editRegionDetector.detectRegion(content, 'Handler');
      assert.strictEqual(range.start, 13);
      assert.strictEqual(range.end, 20);
    });
  });

  describe('Preservation & Optimization Rules', () => {
    it('should extract correct preserved ranges boundaries around edits', () => {
      const content = '0123456789';
      const ops = [
        { type: 'replace' as const, range: { start: 3, end: 6 }, text: 'abc' }
      ];
      const preserved = preservationEngine.identifyPreservedRegions(content, ops);
      assert.deepStrictEqual(preserved, [
        { start: 0, end: 3 },
        { start: 6, end: 10 }
      ]);
    });

    it('should merge contiguous or close range operations', () => {
      const ops = [
        { type: 'replace' as const, range: { start: 5, end: 10 }, text: 'first' },
        { type: 'replace' as const, range: { start: 12, end: 15 }, text: 'second' }
      ];
      const optimized = editOptimizer.optimize(ops);
      assert.strictEqual(optimized.length, 1);
      assert.strictEqual(optimized[0].range.start, 5);
      assert.strictEqual(optimized[0].range.end, 15);
    });
  });

  describe('Edit Plan Compilation', () => {
    it('should coordinate editPlanner pipelines compiling plan data metrics', () => {
      const content = 'import { config } from "./config";\nexport function setup() {\n  console.log("ready");\n}';
      const ops = [
        { type: 'replace' as const, range: { start: 63, end: 83 }, text: 'console.log("setup completed");' }
      ];
      const plan = editPlanner.planEdits('src/main.ts', content, ops);
      assert.ok(plan.editId.startsWith('edit-plan-'));
      assert.strictEqual(plan.targetFile, 'src/main.ts');
      assert.strictEqual(plan.patchOperations.length, 1);
      assert.ok(plan.metrics.preservedRatio > 0.5);
    });
  });
});

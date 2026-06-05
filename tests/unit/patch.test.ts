import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PatchEngine } from '../../src/core/patch/patchEngine';
import { generateDiff } from '../../src/core/patch/diffGenerator';
import { ChangeType, PatchStatus } from '../../src/core/patch/patchTypes';

describe('Patch Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-patch-workspace');
  let engine: PatchEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new PatchEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Diff Generation', () => {
    it('should generate line level diff correctly', () => {
      const oldText = 'line 1\nline 2';
      const newText = 'line 1\nline 3\nline 4';
      const diff = generateDiff(oldText, newText);
      assert.ok(diff.includes('- line 2'));
      assert.ok(diff.includes('+ line 3'));
      assert.ok(diff.includes('+ line 4'));
    });
  });

  describe('Core Patch Lifecycle', () => {
    it('should create, validate, approve, apply, and rollback patches', () => {
      const filePath = 'target.txt';
      const resolved = path.resolve(tempWorkspace, filePath);

      fs.writeFileSync(resolved, 'line 1\nline 2', 'utf8');

      const patch = engine.createPatch(
        'op-01',
        filePath,
        ChangeType.Update,
        'line 1\nline 2',
        'line 1\nline 3'
      );

      assert.strictEqual(patch.status, PatchStatus.Validated);
      assert.ok(patch.diff);

      engine.approvePatch(patch.id);
      assert.strictEqual(patch.status, PatchStatus.Approved);

      engine.applyPatch(patch.id);
      assert.strictEqual(patch.status, PatchStatus.Applied);
      assert.strictEqual(fs.readFileSync(resolved, 'utf8'), 'line 1\nline 3');

      engine.rollbackPatch(patch.id);
      assert.strictEqual(patch.status, PatchStatus.RolledBack);
      assert.strictEqual(fs.readFileSync(resolved, 'utf8'), 'line 1\nline 2');
    });

    it('should catch conflicts during validation', () => {
      const filePath = 'conflict.txt';
      const resolved = path.resolve(tempWorkspace, filePath);
      fs.writeFileSync(resolved, 'initial text', 'utf8');

      const patch = engine.createPatch(
        'op-02',
        filePath,
        ChangeType.Update,
        'expected text',
        'new text'
      );

      assert.strictEqual(patch.status, PatchStatus.Generated);
      assert.throws(() => {
        engine.validatePatch(patch.id);
      }, /Conflict detected/);
    });
  });
});

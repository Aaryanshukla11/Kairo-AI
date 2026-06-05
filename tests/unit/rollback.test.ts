import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { RollbackEngine } from '../../src/core/rollback/rollbackEngine';
import { RollbackStatus } from '../../src/core/rollback/rollbackTypes';
import { Patch, ChangeType, PatchStatus } from '../../src/core/patch/patchTypes';

describe('Rollback Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-rollback-workspace');
  let engine: RollbackEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new RollbackEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Rollback Lifecycle', () => {
    it('should create, validate, and preview rollback plans', () => {
      const patch: Patch = {
        id: 'patch-001',
        operationId: 'op-001',
        filePath: 'target.txt',
        changeType: ChangeType.Update,
        oldContent: 'original text',
        newContent: 'updated text',
        diff: '- original text\n+ updated text',
        status: PatchStatus.Applied,
        createdAt: Date.now()
      };

      const resolved = path.resolve(tempWorkspace, 'target.txt');
      fs.writeFileSync(resolved, 'updated text', 'utf8');

      const rollback = engine.createRollback(patch);
      assert.strictEqual(rollback.status, RollbackStatus.Ready);
      assert.strictEqual(rollback.patchId, patch.id);

      const preview = engine.getPreview(rollback.id, patch);
      assert.strictEqual(preview.linesRestored, 1);
      assert.strictEqual(preview.linesRemoved, 1);
      assert.strictEqual(preview.estimatedImpact, 'Low');
    });

    it('should fail validation if patch has not been applied', () => {
      const patch: Patch = {
        id: 'patch-002',
        operationId: 'op-002',
        filePath: 'target.txt',
        changeType: ChangeType.Update,
        oldContent: 'original text',
        newContent: 'updated text',
        status: PatchStatus.Draft,
        createdAt: Date.now()
      };

      assert.throws(() => {
        engine.createRollback(patch);
      }, /expected "Applied"/);
    });

    it('should fail validation if file changed externally', () => {
      const patch: Patch = {
        id: 'patch-003',
        operationId: 'op-003',
        filePath: 'changed-ext.txt',
        changeType: ChangeType.Update,
        oldContent: 'original text',
        newContent: 'updated text',
        status: PatchStatus.Applied,
        createdAt: Date.now()
      };

      const resolved = path.resolve(tempWorkspace, 'changed-ext.txt');
      fs.writeFileSync(resolved, 'mutated externally', 'utf8');

      assert.throws(() => {
        engine.createRollback(patch);
      }, /modified externally/);
    });
  });
});

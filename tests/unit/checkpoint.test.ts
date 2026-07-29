import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { CheckpointEngine } from '../../src/core/checkpoint/checkpointEngine';
import { CheckpointStatus } from '../../src/core/checkpoint/checkpointTypes';

describe('Checkpoint Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-checkpoint-workspace');
  let engine: CheckpointEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new CheckpointEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Checkpoint Lifecycle', () => {
    it('should create, restore, and delete checkpoints', () => {
      const filePath = 'code.ts';
      const resolved = path.resolve(tempWorkspace, filePath);

      fs.writeFileSync(resolved, 'original code text', 'utf8');

      const cp = engine.createCheckpoint(
        'ws-123',
        'tx-456',
        [filePath]
      );

      assert.strictEqual(cp.status, CheckpointStatus.Active);
      assert.ok(cp.workspaceHash);

      fs.writeFileSync(resolved, 'modified code text', 'utf8');

      engine.restoreCheckpoint(cp.id);
      assert.strictEqual(cp.status, CheckpointStatus.Restored);
      assert.strictEqual(fs.readFileSync(resolved, 'utf8'), 'original code text');

      engine.deleteCheckpoint(cp.id);
      const history = engine.getHistory();
      assert.strictEqual(history.length, 0);
    });

    it('should throw error when metadata tags are missing', () => {
      assert.throws(() => {
        engine.createCheckpoint('', 'tx-789', []);
      }, /Missing workspaceId or transactionId/);
    });

    it('should throw error when snapshot directory is missing on restore', () => {
      const cp = engine.createCheckpoint('ws-456', 'tx-890', []);
      const cpDir = path.resolve(tempWorkspace, '.aiidle', 'checkpoints', cp.id);
      if (fs.existsSync(cpDir)) {
        fs.rmSync(cpDir, { recursive: true, force: true });
      }

      assert.throws(() => {
        engine.restoreCheckpoint(cp.id);
      }, /Snapshot directory is missing/);
    });
  });
});

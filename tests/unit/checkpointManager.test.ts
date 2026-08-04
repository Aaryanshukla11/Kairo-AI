import * as assert from 'assert';
import { checkpointManager } from '../../src/core/checkpointManager/checkpointManager';
import { checkpointBuilder } from '../../src/core/checkpointManager/checkpointBuilder';
import { checkpointValidator } from '../../src/core/checkpointManager/checkpointValidator';
import { checkpointStorage } from '../../src/core/checkpointManager/checkpointStorage';
import { checkpointComparator } from '../../src/core/checkpointManager/checkpointComparator';
import { checkpointRetention } from '../../src/core/checkpointManager/checkpointRetention';
import { checkpointRecovery } from '../../src/core/checkpointManager/checkpointRecovery';
import { checkpointRegistry } from '../../src/core/checkpointManager/checkpointRegistry';

describe('Checkpoint Manager Unit Tests', () => {
  beforeEach(() => {
    checkpointManager.clearHistory();
  });

  describe('Checkpoint Builder & Cryptographic Checksums', () => {
    it('should build checkpoint model and calculate sha256 checksum', () => {
      const chk = checkpointBuilder.buildCheckpoint(
        '1.0.0',
        undefined,
        1000,
        1,
        1000,
        { type: 'AdamW', lr: 1e-4, step: 1000 },
        { type: 'cosine', lastEpoch: 1 },
        { seed: 42 },
        'tok-1',
        'ds-1',
        'cfg-1',
        { validationLoss: 1.5, trainingLoss: 1.4 }
      );

      assert.ok(chk.checkpointId.startsWith('CHK-STEP-'));
      assert.ok(chk.checksum.startsWith('sha256-'));
    });
  });

  describe('Checkpoint Validator & Restorations', () => {
    it('should validate complete templates and flag invalid optimizers or corrupted checksums', () => {
      const chk = checkpointBuilder.buildCheckpoint(
        '1.0.0',
        undefined,
        1000,
        1,
        1000,
        { type: 'AdamW', lr: 1e-4, step: 1000 },
        { type: 'cosine', lastEpoch: 1 },
        { seed: 42 },
        'tok-1',
        'ds-1',
        'cfg-1',
        { validationLoss: 1.5, trainingLoss: 1.4 }
      );

      const val = checkpointValidator.validateCheckpoint(chk);
      assert.strictEqual(val.isValid, true);

      // Corrupt checksum check
      const corrupted = { ...chk, checksum: 'sha256-corrupted' };
      const valCorrupted = checkpointValidator.validateCheckpoint(corrupted);
      assert.strictEqual(valCorrupted.isValid, false);
      assert.ok(valCorrupted.errors[0].includes('checksum mismatch'));
    });
  });

  describe('Storage & Comparator checks', () => {
    it('should compress and save checkpoints to disk providers', () => {
      const chk = checkpointBuilder.buildCheckpoint(
        '1.0.0',
        undefined,
        1000,
        1,
        1000,
        { type: 'AdamW', lr: 1e-4, step: 1000 },
        { type: 'cosine', lastEpoch: 1 },
        { seed: 42 },
        'tok-1',
        'ds-1',
        'cfg-1',
        { validationLoss: 1.5, trainingLoss: 1.4 }
      );

      checkpointStorage.saveCheckpoint(chk);
      const loaded = checkpointStorage.loadCheckpoint(chk.checkpointId);
      assert.ok(loaded);
      assert.strictEqual(loaded.checkpointId, chk.checkpointId);
    });

    it('should compare step, loss, and learning rate deltas between checkpoints', () => {
      const c1: any = {
        checkpointId: 'chk1',
        trainingStep: 1000,
        epoch: 1,
        evaluationResults: { validationLoss: 1.8, trainingLoss: 1.7 },
        optimizerState: { lr: 1e-4 }
      };

      const c2: any = {
        checkpointId: 'chk2',
        trainingStep: 2000,
        epoch: 2,
        evaluationResults: { validationLoss: 1.5, trainingLoss: 1.4 },
        optimizerState: { lr: 5e-5 }
      };

      const comp = checkpointComparator.compare(c1, c2);
      assert.strictEqual(comp.stepDifference, 1000);
      assert.strictEqual(comp.epochDifference, 1);
      assert.strictEqual(comp.valLossDifference, -0.3);
      assert.strictEqual(comp.lrChanged, true);
    });
  });

  describe('Retention Policies Pruner', () => {
    it('should prune old checkpoints based on LatestN rules', () => {
      const optimizerState = { type: 'AdamW', lr: 1e-4, step: 100 };
      const schedulerState = { type: 'cosine', lastEpoch: 1 };
      
      const c1 = checkpointBuilder.buildCheckpoint('1', undefined, 1000, 1, 1000, optimizerState, schedulerState, {}, '1', '1', '1', { validationLoss: 1.8, trainingLoss: 1.7 });
      const c2 = checkpointBuilder.buildCheckpoint('1', undefined, 2000, 2, 2000, optimizerState, schedulerState, {}, '1', '1', '1', { validationLoss: 1.6, trainingLoss: 1.5 });
      const c3 = checkpointBuilder.buildCheckpoint('1', undefined, 3000, 3, 3000, optimizerState, schedulerState, {}, '1', '1', '1', { validationLoss: 1.4, trainingLoss: 1.3 });

      checkpointRegistry.registerCheckpoint(c1);
      checkpointStorage.saveCheckpoint(c1);

      checkpointRegistry.registerCheckpoint(c2);
      checkpointStorage.saveCheckpoint(c2);

      checkpointRegistry.registerCheckpoint(c3);
      checkpointStorage.saveCheckpoint(c3);

      // Apply retention to keep only latest 2
      const pruned = checkpointRetention.applyPolicy({ type: 'LatestN', limitN: 2 });
      assert.strictEqual(pruned.length, 1);
      assert.strictEqual(pruned[0], c1.checkpointId); // c1 should be pruned (oldest)
    });
  });

  describe('Recovery Report & Pipeline End-to-End Run', () => {
    it('should generate recovery instructions', () => {
      const chk = checkpointBuilder.buildCheckpoint(
        '1.0.0',
        undefined,
        1000,
        1,
        1000,
        { type: 'AdamW', lr: 1e-4, step: 1000 },
        { type: 'cosine', lastEpoch: 1 },
        { seed: 42 },
        'tok-1',
        'ds-1',
        'cfg-1',
        { validationLoss: 1.5, trainingLoss: 1.4 }
      );

      const report = checkpointRecovery.generateRecoveryReport(chk);
      assert.strictEqual(report.isRecoverable, true);
      assert.ok(report.restorationSteps.length > 0);
    });

    it('should execute end-to-end snapshot and register successfully', async () => {
      const events: string[] = [];
      const unsubscribe = checkpointManager.subscribe(e => {
        events.push(e.type);
      });

      const optimizerState = { type: 'AdamW', lr: 1e-4, step: 1000 };
      const schedulerState = { type: 'cosine', lastEpoch: 1 };

      const res = await checkpointManager.createCheckpoint(
        '1.0.0',
        undefined,
        1000,
        1,
        1000,
        optimizerState,
        schedulerState,
        { seed: 42 },
        'tok-1',
        'ds-1',
        'cfg-1',
        { validationLoss: 1.5, trainingLoss: 1.4 }
      );

      assert.strictEqual(res.checkpoint.trainingStep, 1000);
      assert.strictEqual(res.recoveryReport.isRecoverable, true);
      assert.ok(res.manifest.fileList.length > 0);

      // Event checks
      assert.ok(events.includes('TrainingStateReceived'));
      assert.ok(events.includes('StateValidated'));
      assert.ok(events.includes('SnapshotCreated'));
      assert.ok(events.includes('CheckpointStored'));

      unsubscribe();
    });
  });
});

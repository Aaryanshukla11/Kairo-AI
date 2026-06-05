import * as assert from 'assert';
import { trainingEngine } from '../../src/core/trainingEngine/trainingEngine';
import { trainingValidator } from '../../src/core/trainingEngine/trainingValidator';
import { trainingScheduler } from '../../src/core/trainingEngine/trainingScheduler';
import { trainingExecutor } from '../../src/core/trainingEngine/trainingExecutor';
import { trainingSession } from '../../src/core/trainingEngine/trainingSession';
import { trainingLoop } from '../../src/core/trainingEngine/trainingLoop';

describe('Training Engine Unit Tests', () => {
  beforeEach(() => {
    trainingEngine.clearHistory();
  });

  describe('Framework Adapters & Executors', () => {
    it('should route step execution correctly to PyTorch / JAX providers adapters', () => {
      const p1 = trainingExecutor.executeBatchStep(5, 'pytorch');
      assert.ok(p1.loss > 0);
      assert.strictEqual(p1.gpuUsage, 94.0);

      const j1 = trainingExecutor.executeBatchStep(5, 'jax');
      assert.ok(j1.loss > 0);
      assert.strictEqual(j1.gpuUsage, 97.0);

      const tf1 = trainingExecutor.executeBatchStep(5, 'tensorflow');
      assert.ok(tf1.loss > 0);
      assert.strictEqual(tf1.gpuUsage, 91.0);
    });
  });

  describe('Training Validator & Scheduler Decay', () => {
    it('should validate complete templates and flag incompatible configs', () => {
      const config: any = { configId: 'cfg-1', hyperparameters: { optimizer: 'AdamW' } };
      const val = trainingValidator.validateInputs('ds-1', 'tok-1', config, undefined, { deviceType: 'cuda' });
      assert.strictEqual(val.isValid, true);

      const invalidVal = trainingValidator.validateInputs('', '', {}, undefined, {});
      assert.strictEqual(invalidVal.isValid, false);
      assert.ok(invalidVal.errors.length >= 4);
    });

    it('should decay learning rates using linear and cosine schedules options', () => {
      const initial = 1e-4;
      const step = 50;
      const total = 100;

      const constantLR = trainingScheduler.calculateLearningRate(initial, step, total, 'constant');
      assert.strictEqual(constantLR, initial);

      const linearLR = trainingScheduler.calculateLearningRate(initial, step, total, 'linear');
      assert.strictEqual(linearLR, 5e-5); // exactly half decay

      const cosineLR = trainingScheduler.calculateLearningRate(initial, step, total, 'cosine');
      assert.ok(cosineLR < initial);
    });
  });

  describe('Training Session state updates & Loop execution', () => {
    it('should update sessions states and record step aggregates progress', () => {
      const sess = trainingSession.initialize('ds-1', 'tok-1', 'cfg-1', 2, 20);
      assert.strictEqual(sess.state, 'Created');

      trainingSession.updateState('Training');
      assert.strictEqual(sess.state, 'Training');

      trainingSession.recordProgress(1, 10, { trainingLoss: 1.2 });
      assert.strictEqual(sess.currentEpoch, 1);
      assert.strictEqual(sess.currentStep, 10);
      assert.strictEqual(sess.metrics.length, 1);
    });

    it('should respect interruption requests and stop loops', async () => {
      const sess = trainingSession.initialize('ds-1', 'tok-1', 'cfg-1', 2, 20);
      const config = { hyperparameters: { learningRate: 1e-4, scheduler: 'constant', optimizer: 'AdamW', batchSize: 32 } };

      trainingLoop.requestInterruption();
      const res = await trainingLoop.run(sess, config, 'pytorch');
      assert.strictEqual(res.savedCheckpoints.length, 0); // loop stopped immediately
    });
  });

  describe('Training Coordinator Engine E2E Pipeline', () => {
    it('should execute complete pipelines and report manifest metrics', async () => {
      const events: string[] = [];
      const unsubscribe = trainingEngine.subscribe(e => {
        events.push(e.type);
      });

      const config = {
        configId: 'cfg-test',
        hyperparameters: { optimizer: 'AdamW', scheduler: 'cosine', learningRate: 1e-4, batchSize: 32 }
      };

      const hardware = { deviceType: 'cuda', deviceCount: 4 };

      const result = await trainingEngine.executeTraining(
        'ds-1.2.0',
        'tok-1.1.0',
        config,
        undefined,
        hardware,
        'pytorch',
        2,
        15 // epoch-1 = step 1-7, epoch-2 = step 8-15
      );

      assert.strictEqual(result.report.status, 'Completed');
      assert.ok(result.report.averageLoss > 0);
      assert.ok(result.manifest.checksum.startsWith('sha256-'));

      // Events checks
      assert.ok(events.includes('TrainingStarted'));
      assert.ok(events.includes('EpochStarted'));
      assert.ok(events.includes('BatchExecuted'));
      assert.ok(events.includes('ValidationExecuted'));
      assert.ok(events.includes('CheckpointSaved'));
      assert.ok(events.includes('TrainingEnded'));

      unsubscribe();
    });
  });
});

import * as assert from 'assert';
import { optimizerRuntime } from '../../src/core/optimizerRuntime/optimizerRuntime';
import { optimizerValidator } from '../../src/core/optimizerRuntime/optimizerValidator';
import { learningRateManager } from '../../src/core/optimizerRuntime/learningRateManager';
import { optimizerPolicies } from '../../src/core/optimizerRuntime/optimizerPolicies';
import { optimizerRegistry } from '../../src/core/optimizerRuntime/optimizerRegistry';
import { parameterUpdateMonitor } from '../../src/core/optimizerRuntime/parameterUpdateMonitor';

describe('Optimizer Runtime Unit Tests', () => {
  beforeEach(() => {
    optimizerRuntime.clearHistory();
  });

  describe('Optimizer Validator Rules', () => {
    it('should validate healthy optimizer states', () => {
      const state = {
        optimizerType: 'AdamW' as const,
        stepCount: 10,
        learningRate: 0.001,
        weightDecay: 0.01,
        momentum: 0.9,
        movingAverageSq: 0.999,
        gradientStats: { norm: 0.1, mean: 0.0, variance: 0.0 }
      };

      const val = optimizerValidator.validate(state, 'Cosine');
      assert.strictEqual(val.isValid, true);
    });

    it('should reject invalid optimizer types', () => {
      const state = {
        optimizerType: 'UnknownOpt' as any,
        stepCount: 10,
        learningRate: 0.001,
        weightDecay: 0.01,
        momentum: 0.9,
        movingAverageSq: 0.999,
        gradientStats: { norm: 0.1, mean: 0.0, variance: 0.0 }
      };

      const val = optimizerValidator.validate(state, 'Cosine');
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors[0].includes('Unsupported optimizer type'));
    });

    it('should reject out of bounds learning rates', () => {
      const state = {
        optimizerType: 'AdamW' as const,
        stepCount: 10,
        learningRate: -0.05,
        weightDecay: 0.01,
        momentum: 0.9,
        movingAverageSq: 0.999,
        gradientStats: { norm: 0.1, mean: 0.0, variance: 0.0 }
      };

      const val = optimizerValidator.validate(state, 'Cosine');
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors[0].includes('Out of bounds learning rate'));
    });
  });

  describe('Learning Rate Schedulers', () => {
    it('should scale learning rate linearly during warmup steps', () => {
      const lr = learningRateManager.calculateLr('Linear', 0.01, 10, 100, 20);
      assert.strictEqual(lr, 0.005); // 0.01 * (10 / 20)
    });

    it('should compute linear learning decay post warmup', () => {
      // Step 60 out of 100 total steps (post warmup step = 40, post warmup total = 80)
      const lr = learningRateManager.calculateLr('Linear', 0.01, 60, 100, 20);
      assert.strictEqual(lr, 0.005); // 0.01 * (1 - 40/80)
    });

    it('should compute cosine learning decay post warmup', () => {
      const lr = learningRateManager.calculateLr('Cosine', 0.01, 20, 100, 0);
      assert.ok(lr < 0.01);
      assert.ok(lr > 0.0);
    });
  });

  describe('Optimizer Policies & State Management', () => {
    it('should upgrade Adam to AdamW if Decoupled weight decay policy is requested', () => {
      const state = {
        optimizerType: 'Adam' as const,
        stepCount: 1,
        learningRate: 0.001,
        weightDecay: 0.01,
        momentum: 0.9,
        movingAverageSq: 0.999,
        gradientStats: { norm: 0.1, mean: 0.0, variance: 0.0 }
      };

      optimizerPolicies.applyPolicy(state, { weightDecayPolicy: 'Decoupled', lrWarmupSteps: 0 });
      assert.strictEqual(state.optimizerType, 'AdamW');
    });

    it('should save and reload states from registry', () => {
      const state = {
        optimizerType: 'SGD' as const,
        stepCount: 5,
        learningRate: 0.01,
        weightDecay: 0.0,
        momentum: 0.9,
        movingAverageSq: 0.0,
        gradientStats: { norm: 0.1, mean: 0.0, variance: 0.0 }
      };

      optimizerRegistry.registerState('SESS-11', state);
      const loaded = optimizerRegistry.getState('SESS-11');
      assert.ok(loaded);
      assert.strictEqual(loaded.stepCount, 5);
    });
  });

  describe('Parameter Update Monitor', () => {
    it('should evaluate parameter updates norm size validity checks', () => {
      const rep = parameterUpdateMonitor.monitorUpdates(0.5, 0.01);
      assert.strictEqual(rep.updatesNorm, 0.005);
      assert.strictEqual(rep.isValid, true);
    });
  });

  describe('Optimizer Runtime Pipeline E2E Coordinator Run', () => {
    it('should run complete pipelines pipeline, log history actions, and generate manifest outputs', async () => {
      const state = {
        optimizerType: 'AdamW' as const,
        stepCount: 0,
        learningRate: 0.001,
        weightDecay: 0.01,
        momentum: 0.9,
        movingAverageSq: 0.999,
        gradientStats: { norm: 0.354, mean: 0.002, variance: 0.0007 }
      };

      const events: string[] = [];
      const unsubscribe = optimizerRuntime.subscribe(e => {
        events.push(e.type);
      });

      const res = await optimizerRuntime.optimize(
        'SESS-99',
        state,
        0.354,
        'Cosine',
        { weightDecayPolicy: 'L2', lrWarmupSteps: 10 },
        100,
        10
      );

      assert.strictEqual(res.validationReport.isValid, true);
      assert.strictEqual(res.updateReport.isValid, true);
      assert.strictEqual(res.optimizerReport.stepCount, 1);
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Event checks
      assert.ok(events.includes('GradientsReceived'));
      assert.ok(events.includes('Validated'));
      assert.ok(events.includes('UpdatesApplied'));
      assert.ok(events.includes('LrUpdated'));
      assert.ok(events.includes('StateStored'));
      assert.ok(events.includes('ReportsGenerated'));

      unsubscribe();
    });
  });
});

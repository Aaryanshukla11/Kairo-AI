import * as assert from 'assert';
import { validationLoop } from '../../src/core/validationLoop/validationLoop';
import { validationScheduler } from '../../src/core/validationLoop/validationScheduler';
import { validationValidator } from '../../src/core/validationLoop/validationValidator';
import { metricAggregator } from '../../src/core/validationLoop/metricAggregator';
import { overfittingDetector } from '../../src/core/validationLoop/overfittingDetector';
import { checkpointEvaluator } from '../../src/core/validationLoop/checkpointEvaluator';
import { ValidationLoopEventType } from '../../src/core/validationLoop/validationTypes';

describe('Validation Loop Subsystem Unit Tests', () => {
  beforeEach(() => {
    validationLoop.clearHistory();
  });

  describe('Validation Scheduler', () => {
    it('should determine epoch_end validation schedule checks', () => {
      const session = {
        sessionId: 'S-1',
        state: 'Training' as const,
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        configurationVersion: 'C-1',
        currentEpoch: 1,
        currentStep: 50,
        totalEpochs: 10,
        totalSteps: 500,
        startTime: Date.now(),
        metrics: []
      };

      const config = {
        configId: 'C-1',
        version: '1.0.0',
        trainingType: 'Fine-tuning',
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        modelArchitecture: 'transformer',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'fp32',
          batchSize: 32,
          gradientAccumulation: 1,
          learningRate: 1e-4,
          warmupRatio: 0.1,
          epochs: 10,
          randomSeed: 42,
          mixedPrecision: false
        },
        hardwareProfile: { deviceType: 'cpu', deviceCount: 1, precisionSupported: ['fp32'], maxBatchSize: 32 },
        checkpointFrequency: 50,
        evaluationFrequency: 50,
        createdAt: Date.now()
      };

      // at step 50 (first epoch end step since 500 steps/10 epochs = 50 steps/epoch)
      const trigger = validationScheduler.shouldTriggerValidation('epoch_end', session, config);
      assert.strictEqual(trigger, true);

      // at step 40 (not epoch end)
      session.currentStep = 40;
      const noTrigger = validationScheduler.shouldTriggerValidation('epoch_end', session, config);
      assert.strictEqual(noTrigger, false);
    });

    it('should trigger fixed_interval validation based on configuration settings', () => {
      const session = {
        sessionId: 'S-1',
        state: 'Training' as const,
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        configurationVersion: 'C-1',
        currentEpoch: 1,
        currentStep: 100,
        totalEpochs: 10,
        totalSteps: 500,
        startTime: Date.now(),
        metrics: []
      };

      const config = {
        configId: 'C-1',
        version: '1.0.0',
        trainingType: 'Fine-tuning',
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        modelArchitecture: 'transformer',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'fp32',
          batchSize: 32,
          gradientAccumulation: 1,
          learningRate: 1e-4,
          warmupRatio: 0.1,
          epochs: 10,
          randomSeed: 42,
          mixedPrecision: false
        },
        hardwareProfile: { deviceType: 'cpu', deviceCount: 1, precisionSupported: ['fp32'], maxBatchSize: 32 },
        checkpointFrequency: 100,
        evaluationFrequency: 100,
        createdAt: Date.now()
      };

      assert.strictEqual(validationScheduler.shouldTriggerValidation('fixed_interval', session, config), true);

      session.currentStep = 90;
      assert.strictEqual(validationScheduler.shouldTriggerValidation('fixed_interval', session, config), false);
    });
  });

  describe('Validation Input Validator Checks', () => {
    it('should error out when checkpoint is missing', () => {
      const res = validationValidator.validateInputs(undefined, 'data/val.json', undefined);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors[0].includes('No checkpoint provided'));
    });

    it('should validate complete metrics boundaries correctly', () => {
      const checkpoint = {
        checkpointId: 'CHK-1',
        version: '1.0.0',
        trainingStep: 100,
        epoch: 1,
        globalStep: 100,
        optimizerState: { type: 'AdamW', lr: 1e-4, step: 100 },
        schedulerState: { type: 'cosine', lastEpoch: 1 },
        randomSeeds: {},
        tokenizerVersion: 'T-1',
        datasetVersion: 'D-1',
        configurationVersion: 'C-1',
        evaluationResults: { validationLoss: 1.050, trainingLoss: 0.950 },
        creationTimestamp: Date.now(),
        checksum: 'abc'
      };

      const badMetrics = {
        validationLoss: -1.0, // negative loss
        accuracy: 1.5, // above 1.0
        perplexity: 0.0, // zero
        passRate: 0.8,
        inferenceTimeMs: 10,
        tokensPerSec: 100,
        memoryUsageMB: 200,
        benchmarkScore: 80
      };

      const res = validationValidator.validateInputs(checkpoint, 'val.json', undefined, badMetrics);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('cannot be negative')));
      assert.ok(res.errors.some(e => e.includes('must be between 0.0 and 1.0')));
      assert.ok(res.errors.some(e => e.includes('must be strictly positive')));
    });
  });

  describe('Metric Aggregator', () => {
    it('should calculate averages and peak memory usages across sub-passes', () => {
      const runs = [
        { validationLoss: 1.20, accuracy: 0.80, perplexity: 3.0, passRate: 0.95, inferenceTimeMs: 120.0, tokensPerSec: 1500.0, memoryUsageMB: 2000.0, benchmarkScore: 82.0 },
        { validationLoss: 1.10, accuracy: 0.82, perplexity: 2.8, passRate: 0.97, inferenceTimeMs: 130.0, tokensPerSec: 1600.0, memoryUsageMB: 2500.0, benchmarkScore: 84.0 }
      ];

      const res = metricAggregator.aggregate(runs);
      assert.strictEqual(res.validationLoss, 1.15);
      assert.strictEqual(res.accuracy, 0.81);
      assert.strictEqual(res.perplexity, 2.9);
      assert.strictEqual(res.memoryUsageMB, 2500.0); // max memory
      assert.strictEqual(res.benchmarkScore, 83.0);
    });
  });

  describe('Overfitting Detector Auditing', () => {
    it('should trigger generalization gap checks', () => {
      const current = { validationLoss: 1.55, accuracy: 0.80, perplexity: 3.0, passRate: 0.95, inferenceTimeMs: 100, tokensPerSec: 1000, memoryUsageMB: 1000, benchmarkScore: 80 };
      const trainHistory = [{ epoch: 1, batch: 10, trainingLoss: 0.95, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 2000, vramUsageMB: 3000, tokensPerSec: 1000, elapsedSec: 60, estimatedRemainingSec: 60 }];

      const res = overfittingDetector.detectOverfitting(current, trainHistory, []);
      assert.strictEqual(res.generalizationGap, true);
      assert.strictEqual(res.generalizationGapValue, 0.6); // 1.55 - 0.95
    });

    it('should trigger loss divergence alerts', () => {
      const current = { validationLoss: 1.45, accuracy: 0.80, perplexity: 3.0, passRate: 0.95, inferenceTimeMs: 100, tokensPerSec: 1000, memoryUsageMB: 1000, benchmarkScore: 80 };
      const trainHistory = [
        { epoch: 1, batch: 10, trainingLoss: 1.10, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 2000, vramUsageMB: 3000, tokensPerSec: 1000, elapsedSec: 60, estimatedRemainingSec: 60 },
        { epoch: 1, batch: 20, trainingLoss: 1.00, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 2000, vramUsageMB: 3000, tokensPerSec: 1000, elapsedSec: 120, estimatedRemainingSec: 60 },
        { epoch: 1, batch: 30, trainingLoss: 0.90, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 2000, vramUsageMB: 3000, tokensPerSec: 1000, elapsedSec: 180, estimatedRemainingSec: 60 }
      ];
      // validation loss increases from 1.25 -> 1.35 -> 1.45
      const pastVal = [
        { validationLoss: 1.25, accuracy: 0.82, perplexity: 3.0, passRate: 0.95, inferenceTimeMs: 100, tokensPerSec: 1000, memoryUsageMB: 1000, benchmarkScore: 80 },
        { validationLoss: 1.35, accuracy: 0.81, perplexity: 3.0, passRate: 0.95, inferenceTimeMs: 100, tokensPerSec: 1000, memoryUsageMB: 1000, benchmarkScore: 80 }
      ];

      const res = overfittingDetector.detectOverfitting(current, trainHistory, pastVal);
      assert.strictEqual(res.lossDivergence, true);
      assert.strictEqual(res.severity, 'critical');
    });
  });

  describe('Checkpoint Evaluator Deltas Comparison', () => {
    it('should recognize when a checkpoint improves validation outputs', () => {
      const current = { validationLoss: 1.05, accuracy: 0.85, perplexity: 2.8, passRate: 0.98, inferenceTimeMs: 120, tokensPerSec: 1500, memoryUsageMB: 2000, benchmarkScore: 85 };
      const baseline = { validationLoss: 1.10, accuracy: 0.83, perplexity: 3.0, passRate: 0.97, inferenceTimeMs: 125, tokensPerSec: 1450, memoryUsageMB: 2100, benchmarkScore: 83 };

      const res = checkpointEvaluator.compare(current, baseline, 'CHK-2', 'CHK-1');
      assert.strictEqual(res.isBetter, true);
      assert.strictEqual(res.lossDelta, -0.05);
      assert.strictEqual(res.accuracyDelta, 0.02);
    });
  });

  describe('Validation Loop E2E Pipeline coordinator run', () => {
    it('should complete validation pipeline execution, log events, publish manifest report', async () => {
      const session = {
        sessionId: 'SESS-E2E-VAL',
        state: 'Training' as const,
        datasetVersion: 'D-99',
        tokenizerVersion: 'T-99',
        configurationVersion: 'C-99',
        currentEpoch: 2,
        currentStep: 200,
        totalEpochs: 10,
        totalSteps: 1000,
        startTime: Date.now(),
        metrics: [
          { epoch: 1, batch: 50, trainingLoss: 1.10, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 2000, vramUsageMB: 3000, tokensPerSec: 1000, elapsedSec: 60, estimatedRemainingSec: 60 }
        ]
      };

      const checkpoint = {
        checkpointId: 'CHK-99',
        version: '1.0.0',
        trainingStep: 200,
        epoch: 2,
        globalStep: 200,
        optimizerState: { type: 'AdamW', lr: 1e-4, step: 200 },
        schedulerState: { type: 'cosine', lastEpoch: 2 },
        randomSeeds: {},
        tokenizerVersion: 'T-99',
        datasetVersion: 'D-99',
        configurationVersion: 'C-99',
        evaluationResults: { validationLoss: 1.050, trainingLoss: 1.100 },
        creationTimestamp: Date.now(),
        checksum: 'abc'
      };

      const config = {
        configId: 'C-99',
        version: '1.0.0',
        trainingType: 'Fine-tuning',
        datasetVersion: 'D-99',
        tokenizerVersion: 'T-99',
        modelArchitecture: 'transformer',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'fp16',
          batchSize: 32,
          gradientAccumulation: 1,
          learningRate: 1e-4,
          warmupRatio: 0.1,
          epochs: 10,
          randomSeed: 42,
          mixedPrecision: true
        },
        hardwareProfile: { deviceType: 'cuda', deviceCount: 2, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 },
        checkpointFrequency: 100,
        evaluationFrequency: 100,
        createdAt: Date.now()
      };

      const events: string[] = [];
      const unsubscribe = validationLoop.subscribe(e => {
        events.push(e.type);
      });

      const res = await validationLoop.processValidationRun(
        'SESS-E2E-VAL',
        'fixed_interval',
        session,
        'data/val.json',
        checkpoint,
        config
      );

      assert.strictEqual(res.validationReport.isValid, true);
      assert.strictEqual(res.isBetterThanBaseline, true); // no baseline provided defaults to true
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Event checks
      assert.ok(events.includes(ValidationLoopEventType.IngestState));
      assert.ok(events.includes(ValidationLoopEventType.DatasetLoaded));
      assert.ok(events.includes(ValidationLoopEventType.ValidationExecuted));
      assert.ok(events.includes(ValidationLoopEventType.MetricsCollected));
      assert.ok(events.includes(ValidationLoopEventType.ResultsAggregated));
      assert.ok(events.includes(ValidationLoopEventType.HistoryCompared));
      assert.ok(events.includes(ValidationLoopEventType.ReportsGenerated));
      assert.ok(events.includes(ValidationLoopEventType.EventsPublished));

      unsubscribe();
    });
  });
});

import * as assert from 'assert';
import { mixedPrecisionEngine } from '../../src/core/mixedPrecision/mixedPrecisionEngine';
import { precisionSelector } from '../../src/core/mixedPrecision/precisionSelector';
import { precisionCompatibility } from '../../src/core/mixedPrecision/precisionCompatibility';
import { lossScalingManager } from '../../src/core/mixedPrecision/lossScalingManager';
import { overflowMonitor } from '../../src/core/mixedPrecision/overflowMonitor';
import { precisionPolicyManager } from '../../src/core/mixedPrecision/precisionPolicyManager';
import { PrecisionEventType } from '../../src/core/mixedPrecision/precisionTypes';

describe('Mixed Precision Engine Unit Tests', () => {
  beforeEach(() => {
    mixedPrecisionEngine.clearHistory();
  });

  describe('Precision Selector', () => {
    it('should return exact requested mode if not automatic', () => {
      const hw = { deviceType: 'cuda', deviceCount: 1, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 };
      assert.strictEqual(precisionSelector.selectPrecision('fp32', hw), 'fp32');
      assert.strictEqual(precisionSelector.selectPrecision('fp16', hw), 'fp16');
    });

    it('should select bf16 when automatic mode is requested and hardware supports bf16', () => {
      const hw = { deviceType: 'cuda', deviceCount: 4, precisionSupported: ['fp32', 'fp16', 'bf16'], maxBatchSize: 128 };
      assert.strictEqual(precisionSelector.selectPrecision('automatic', hw), 'bf16');
    });

    it('should fallback to fp16 when hardware supports fp16 but not bf16', () => {
      const hw = { deviceType: 'cuda', deviceCount: 1, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 };
      assert.strictEqual(precisionSelector.selectPrecision('automatic', hw), 'fp16');
    });

    it('should default to fp32 on CPU', () => {
      const hw = { deviceType: 'cpu', deviceCount: 1, precisionSupported: ['fp32'], maxBatchSize: 32 };
      assert.strictEqual(precisionSelector.selectPrecision('automatic', hw), 'fp32');
    });
  });

  describe('Hardware Compatibility Validation', () => {
    it('should validate fp32 is always compatible', () => {
      const hw = { deviceType: 'cpu', deviceCount: 1, precisionSupported: ['fp32'], maxBatchSize: 32 };
      const report = precisionCompatibility.validateCompatibility(hw, 'fp32');
      assert.strictEqual(report.isCompatible, true);
      assert.strictEqual(report.issues.length, 0);
    });

    it('should report incompatibility for bf16 on CPU', () => {
      const hw = { deviceType: 'cpu', deviceCount: 1, precisionSupported: ['fp32'], maxBatchSize: 32 };
      const report = precisionCompatibility.validateCompatibility(hw, 'bf16');
      assert.strictEqual(report.isCompatible, false);
      assert.ok(report.issues[0].includes('not supported on device'));
    });

    it('should validate fp16 is compatible on GPU if listed', () => {
      const hw = { deviceType: 'cuda', deviceCount: 1, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 };
      const report = precisionCompatibility.validateCompatibility(hw, 'fp16');
      assert.strictEqual(report.isCompatible, true);
    });
  });

  describe('Loss Scaling Adjustments', () => {
    it('should maintain static scale factor', () => {
      const policy = {
        policyId: 'pol-1',
        precisionMode: 'fp32',
        lossScalingMode: 'static' as const,
        initialScale: 1024.0,
        minScale: 1.0,
        maxScale: 2048.0
      };
      lossScalingManager.configure('SESS-1', policy);

      const scale1 = lossScalingManager.adjustScale('SESS-1', false, 1);
      assert.strictEqual(scale1, 1024.0);

      const scale2 = lossScalingManager.adjustScale('SESS-1', true, 2);
      assert.strictEqual(scale2, 1024.0);
    });

    it('should back off scale factor on overflow in dynamic mode', () => {
      const policy = {
        policyId: 'pol-2',
        precisionMode: 'fp16',
        lossScalingMode: 'dynamic' as const,
        initialScale: 1000.0,
        minScale: 10.0,
        maxScale: 10000.0,
        backoffFactor: 0.5,
        growthFactor: 2.0,
        hysteresis: 5
      };
      lossScalingManager.configure('SESS-2', policy);

      const scale = lossScalingManager.adjustScale('SESS-2', true, 1);
      assert.strictEqual(scale, 500.0);
    });

    it('should grow scale factor after hysteresis steps without overflow', () => {
      const policy = {
        policyId: 'pol-3',
        precisionMode: 'fp16',
        lossScalingMode: 'dynamic' as const,
        initialScale: 1000.0,
        minScale: 10.0,
        maxScale: 10000.0,
        backoffFactor: 0.5,
        growthFactor: 2.0,
        hysteresis: 2
      };
      lossScalingManager.configure('SESS-3', policy);

      lossScalingManager.adjustScale('SESS-3', false, 1);
      const scale = lossScalingManager.adjustScale('SESS-3', false, 2);
      assert.strictEqual(scale, 2000.0);
    });
  });

  describe('Overflow and Underflow Monitoring', () => {
    it('should identify NaN/Inf overflows in loss values', () => {
      const lossReport = {
        reportId: 'L-1',
        sessionId: 'SESS-4',
        strategy: 'Cross Entropy' as const,
        currentLoss: NaN,
        averageLoss: 1.2,
        minLoss: 1.0,
        maxLoss: 1.5,
        lossVariance: 0.01,
        movingAverage: 1.2,
        lossTrend: 'stable' as const,
        createdAt: Date.now()
      };

      const res = overflowMonitor.monitorExecution('SESS-4', 1, undefined, lossReport, false);
      assert.strictEqual(res.hasOverflow, true);
      assert.strictEqual(res.layerIssues[0].layerName, 'loss');
      assert.strictEqual(res.layerIssues[0].issueType, 'NaN');
    });

    it('should identify NaNs in gradient layers', () => {
      const gradientReport = {
        reportId: 'G-1',
        sessionId: 'SESS-5',
        globalNorm: 1.0,
        globalMean: 0.1,
        globalVariance: 0.05,
        layers: [
          { layerName: 'layer_1', gradNorm: NaN, gradMean: 0.0, gradVariance: 0.0, gradDensity: 1.0, values: [NaN] }
        ],
        createdAt: Date.now()
      };

      const res = overflowMonitor.monitorExecution('SESS-5', 1, gradientReport, undefined, false);
      assert.strictEqual(res.hasOverflow, true);
      assert.strictEqual(res.layerIssues[0].layerName, 'layer_1');
      assert.strictEqual(res.layerIssues[0].issueType, 'NaN');
    });

    it('should detect persistent overflow after consecutive overflows at minimum scale', () => {
      const session = 'SESS-6';
      // Simulate 5 steps of overflow
      let res;
      for (let i = 1; i <= 5; i++) {
        const gradientReport = {
          reportId: `G-${i}`,
          sessionId: session,
          globalNorm: 1.0,
          globalMean: 0.1,
          globalVariance: 0.05,
          layers: [
            { layerName: 'layer_1', gradNorm: NaN, gradMean: 0.0, gradVariance: 0.0, gradDensity: 1.0, values: [NaN] }
          ],
          createdAt: Date.now()
        };
        res = overflowMonitor.monitorExecution(session, i, gradientReport, undefined, true);
      }
      assert.strictEqual(res?.persistentOverflow, true);
    });
  });

  describe('Mixed Precision Engine E2E pipeline run', () => {
    it('should execute full precision flow step, emit events, and publish report and manifest', async () => {
      const config = {
        configId: 'C-99',
        version: '1.0',
        trainingType: 'Fine-tuning',
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        modelArchitecture: 'transformer',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'automatic',
          batchSize: 32,
          gradientAccumulation: 1,
          learningRate: 1e-4,
          warmupRatio: 0.1,
          epochs: 3,
          randomSeed: 42,
          mixedPrecision: true
        },
        hardwareProfile: {
          deviceType: 'cuda',
          deviceCount: 4,
          precisionSupported: ['fp32', 'fp16', 'bf16'],
          maxBatchSize: 128
        },
        checkpointFrequency: 100,
        evaluationFrequency: 100,
        createdAt: Date.now()
      };

      const hw = config.hardwareProfile;

      const events: string[] = [];
      const unsubscribe = mixedPrecisionEngine.subscribe(e => {
        events.push(e.type);
      });

      const res = await mixedPrecisionEngine.processSessionStep(
        'SESS-E2E',
        1,
        config,
        hw,
        undefined,
        undefined
      );

      assert.strictEqual(res.precisionMode, 'bf16'); // auto chooses bf16
      assert.strictEqual(res.hasOverflow, false);
      assert.strictEqual(res.precisionReport.precisionMode, 'bf16');
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Event checks
      assert.ok(events.includes(PrecisionEventType.ConfigReceived));
      assert.ok(events.includes(PrecisionEventType.HardwareValidated));
      assert.ok(events.includes(PrecisionEventType.PrecisionSelected));
      assert.ok(events.includes(PrecisionEventType.LossScalingConfigured));
      assert.ok(events.includes(PrecisionEventType.ExecutionMonitored));
      assert.ok(events.includes(PrecisionEventType.ReportsPublished));

      unsubscribe();
    });
  });
});

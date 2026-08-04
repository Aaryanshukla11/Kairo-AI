import * as assert from 'assert';
import { gradientEngine } from '../../src/core/gradientEngine/gradientEngine';
import { gradientValidator } from '../../src/core/gradientEngine/gradientValidator';
import { clippingManager } from '../../src/core/gradientEngine/clippingManager';
import { anomalyDetector } from '../../src/core/gradientEngine/anomalyDetector';
import { gradientAggregator } from '../../src/core/gradientEngine/gradientAggregator';
import { gradientStatistics } from '../../src/core/gradientEngine/gradientStatistics';

describe('Gradient Engine Unit Tests', () => {
  beforeEach(() => {
    gradientEngine.clearHistory();
  });

  describe('Gradient Validator Rules', () => {
    it('should validate healthy gradient layers', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 0.1, gradMean: 0.01, gradVariance: 0.001, gradDensity: 1.0, values: [0.05, -0.05] }
      ];

      const val = gradientValidator.validate(layers, 'pytorch');
      assert.strictEqual(val.isValid, true);
    });

    it('should catch NaNs and Infinities inside parameter tensors', () => {
      const layers = [
        { layerName: 'layer_nan', gradNorm: 0.1, gradMean: 0.0, gradVariance: 0.0, gradDensity: 1.0, values: [NaN] },
        { layerName: 'layer_inf', gradNorm: 0.2, gradMean: 0.0, gradVariance: 0.0, gradDensity: 1.0, values: [Infinity] }
      ];

      const val = gradientValidator.validate(layers, 'pytorch');
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors.some(e => e.includes('NaN detected')));
      assert.ok(val.errors.some(e => e.includes('Infinity detected')));
    });

    it('should catch empty layers list configuration error', () => {
      const val = gradientValidator.validate([], 'pytorch');
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors[0].includes('at least one gradient tensor layer'));
    });
  });

  describe('Clipping Policies', () => {
    it('should clip elements exceeding maximum value thresholds', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 1.2, gradMean: 0.2, gradVariance: 0.05, gradDensity: 1.0, values: [0.5, -0.9, 0.4] }
      ];

      const res = clippingManager.applyClipping(layers, { type: 'Value', threshold: 0.3 });
      assert.strictEqual(res.clippedCount, 2); // 0.5 and -0.9 are clipped to 0.3 and -0.3
      assert.deepStrictEqual(layers[0].values, [0.3, -0.3, 0.3]);
    });

    it('should scale norms values exceeding maximum norm bounds', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 2.5, gradMean: 0.5, gradVariance: 0.1, gradDensity: 1.0, values: [1.5, -2.0] }
      ];

      const res = clippingManager.applyClipping(layers, { type: 'Norm', threshold: 1.0 });
      assert.strictEqual(res.clippedCount, 1);
      assert.strictEqual(layers[0].gradNorm, 1.0);
      assert.deepStrictEqual(layers[0].values, [0.6, -0.8]); // scaled by 1.0 / 2.5 = 0.4
    });
  });

  describe('Anomaly Detection', () => {
    it('should report exploding gradients norm exceed limits', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 12.4, gradMean: 2.1, gradVariance: 1.5, gradDensity: 1.0, values: [12.4] }
      ];

      const res = anomalyDetector.detectAnomalies(layers);
      assert.strictEqual(res.hasAnomaly, true);
      assert.strictEqual(res.explodingGradients, true);
      assert.ok(res.issues[0].includes('Exploding gradients detected'));
    });

    it('should report vanishing gradients below minimum limits', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 1e-9, gradMean: 0.0, gradVariance: 0.0, gradDensity: 1.0, values: [1e-9] }
      ];

      const res = anomalyDetector.detectAnomalies(layers);
      assert.strictEqual(res.hasAnomaly, true);
      assert.strictEqual(res.vanishingGradients, true);
      assert.ok(res.issues[0].includes('Vanishing gradients detected'));
    });

    it('should report sparse layers warnings if density is low', () => {
      const layers = [
        { layerName: 'layer_1', gradNorm: 0.5, gradMean: 0.01, gradVariance: 0.01, gradDensity: 0.05, values: [0.5, 0.0] }
      ];

      const res = anomalyDetector.detectAnomalies(layers);
      assert.strictEqual(res.hasAnomaly, true);
      assert.strictEqual(res.sparseGradients, true);
      assert.ok(res.issues[0].includes('High sparsity detected'));
    });
  });

  describe('Gradient Engine Pipeline E2E Coordinator Run', () => {
    it('should run complete pipelines pipeline, log events, and compile manifests reports', async () => {
      const layers = [
        { layerName: 'attn.q_proj.weight', gradNorm: 0.154, gradMean: 0.002, gradVariance: 0.0004, gradDensity: 0.98, values: [0.01, -0.02, 0.005] },
        { layerName: 'attn.k_proj.weight', gradNorm: 0.128, gradMean: -0.001, gradVariance: 0.0003, gradDensity: 0.99, values: [-0.005, 0.01, 0.002] }
      ];

      const events: string[] = [];
      const unsubscribe = gradientEngine.subscribe(e => {
        events.push(e.type);
      });

      const res = await gradientEngine.processGradients(
        'SESS-9988',
        layers,
        { type: 'Norm', threshold: 1.0 },
        'pytorch'
      );

      assert.strictEqual(res.validationReport.isValid, true);
      assert.strictEqual(res.anomalyReport.hasAnomaly, false);
      assert.strictEqual(res.clippedCount, 0); // norm is below 1.0
      assert.ok(res.gradientReport.globalNorm > 0);
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Event checks
      assert.ok(events.includes('GradientsReceived'));
      assert.ok(events.includes('Validated'));
      assert.ok(events.includes('Aggregated'));
      assert.ok(events.includes('AnomaliesDetected'));
      assert.ok(events.includes('ReportsPublished'));

      unsubscribe();
    });
  });
});

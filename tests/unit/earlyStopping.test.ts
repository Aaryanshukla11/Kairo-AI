import * as assert from 'assert';
import { earlyStoppingEngine } from '../../src/core/earlyStopping/earlyStoppingEngine';
import { stoppingPolicyManager } from '../../src/core/earlyStopping/stoppingPolicyManager';
import { stoppingValidator } from '../../src/core/earlyStopping/stoppingValidator';
import { patienceManager } from '../../src/core/earlyStopping/patienceManager';
import { convergenceMonitor } from '../../src/core/earlyStopping/convergenceMonitor';
import { plateauDetector } from '../../src/core/earlyStopping/plateauDetector';
import { stoppingDecisionEngine } from '../../src/core/earlyStopping/stoppingDecisionEngine';
import { recommendationEngine } from '../../src/core/earlyStopping/recommendationEngine';
import { EarlyStoppingEventType } from '../../src/core/earlyStopping/stoppingTypes';

describe('Early Stopping Engine Subsystem Unit Tests', () => {
  beforeEach(() => {
    earlyStoppingEngine.clearHistory();
  });

  describe('Policy Configuration Registration', () => {
    it('should fall back to default policies if none are registered', () => {
      const policies = stoppingPolicyManager.getPolicies('SESS-TEMP-1');
      assert.strictEqual(policies.length, 1);
      assert.strictEqual(policies[0].metric, 'validationLoss');
      assert.strictEqual(policies[0].patienceWindow, 3);
    });

    it('should register and retrieve customized stopping policies', () => {
      const customConfig = [
        {
          metric: 'accuracy' as const,
          patienceWindow: 5,
          mode: 'max' as const,
          minImprovement: 0.005
        }
      ];
      earlyStoppingEngine.registerSessionPolicies('S-REG-1', customConfig);
      const retrieved = stoppingPolicyManager.getPolicies('S-REG-1');
      assert.strictEqual(retrieved.length, 1);
      assert.strictEqual(retrieved[0].metric, 'accuracy');
      assert.strictEqual(retrieved[0].patienceWindow, 5);
    });
  });

  describe('Stopping Validator checks', () => {
    it('should report invalid on empty session or negative steps', () => {
      const res = stoppingValidator.validateInputs(undefined, undefined, undefined);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors[0].includes('session is missing'));
    });

    it('should catch invalid policy config properties', () => {
      const session = {
        sessionId: 'S-V-1',
        state: 'Training' as const,
        datasetVersion: 'D-1',
        tokenizerVersion: 'T-1',
        configurationVersion: 'C-1',
        currentEpoch: 1,
        currentStep: 10,
        totalEpochs: 10,
        totalSteps: 100,
        startTime: Date.now(),
        metrics: []
      };

      const badPolicies = [
        {
          metric: 'accuracy' as const,
          patienceWindow: -1, // invalid negative patience
          mode: 'max' as const,
          minImprovement: -0.01 // invalid negative improvement
        }
      ];

      const res = stoppingValidator.validateInputs(session, undefined, undefined, badPolicies);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('Patience window must be greater than zero')));
      assert.ok(res.errors.some(e => e.includes('Min improvement cannot be negative')));
    });
  });

  describe('Patience Tracking logic', () => {
    it('should increment stepsSinceImprovement when no improvement is made', () => {
      const state1 = patienceManager.updateState('S-P-1', 'validationLoss', 1.05, 10, true, 'min');
      assert.strictEqual(state1.bestScore, 1.05);
      assert.strictEqual(state1.stepsSinceImprovement, 0);

      const state2 = patienceManager.updateState('S-P-1', 'validationLoss', 1.06, 20, false, 'min');
      assert.strictEqual(state2.bestScore, 1.05); // best remains same
      assert.strictEqual(state2.stepsSinceImprovement, 1);
    });

    it('should generate patience reports correctly', () => {
      patienceManager.updateState('S-P-2', 'accuracy', 0.85, 10, true, 'max');
      patienceManager.updateState('S-P-2', 'accuracy', 0.84, 20, false, 'max');
      patienceManager.updateState('S-P-2', 'accuracy', 0.83, 30, false, 'max');

      const rep = patienceManager.calculateReport('S-P-2', 'accuracy', 5);
      assert.strictEqual(rep.bestScore, 0.85);
      assert.strictEqual(rep.plateauLength, 2);
      assert.strictEqual(rep.patienceWindow, 5);
    });
  });

  describe('Trends and Plateau Monitors', () => {
    it('should detect convergence rate changes in training loss', () => {
      const history = [
        { epoch: 1, batch: 10, trainingLoss: 1.1000, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 100, vramUsageMB: 100, tokensPerSec: 100, elapsedSec: 10, estimatedRemainingSec: 10 },
        { epoch: 1, batch: 20, trainingLoss: 1.0999, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 100, vramUsageMB: 100, tokensPerSec: 100, elapsedSec: 10, estimatedRemainingSec: 10 },
        { epoch: 1, batch: 30, trainingLoss: 1.0998, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 100, vramUsageMB: 100, tokensPerSec: 100, elapsedSec: 10, estimatedRemainingSec: 10 }
      ];

      const res = convergenceMonitor.analyzeConvergence(history);
      assert.strictEqual(res.isConverging, true);
      assert.strictEqual(res.hasStagnated, true); // step deltas are very small
    });

    it('should flag plateau states when metrics values stay stagnant', () => {
      const values = [1.025, 1.026, 1.025, 1.024];
      const res = plateauDetector.detectPlateau(values, 0.005, 3);
      assert.strictEqual(res.isPlateaued, true);
      assert.strictEqual(res.plateauLength, 4);
    });
  });

  describe('Decision Engine & Recommendations', () => {
    it('should output STOP decision when stepsSinceImprovement matches or exceeds patience', () => {
      const config = { metric: 'validationLoss' as const, patienceWindow: 3, mode: 'min' as const };
      const decision = stoppingDecisionEngine.generateDecision('S-D-1', config, 1.10, 1.05, 3, 3, false);
      assert.strictEqual(decision.decision, 'stop');
      assert.ok(decision.reason.includes('patience window of 3 exceeded'));

      const rec = recommendationEngine.generateRecommendation(config, decision, 3, false, false);
      assert.strictEqual(rec.suggestedAction, 'stop');
      assert.strictEqual(rec.severity, 'critical');
    });

    it('should pause and ask for review when overfitting divergence is flagged', () => {
      const config = { metric: 'validationLoss' as const, patienceWindow: 3, mode: 'min' as const };
      const decision = stoppingDecisionEngine.generateDecision('S-D-2', config, 1.15, 1.05, 1, 1, true);
      assert.strictEqual(decision.decision, 'require_manual_review');

      const rec = recommendationEngine.generateRecommendation(config, decision, 1, true, false);
      assert.strictEqual(rec.suggestedAction, 'pause_and_review');
      assert.strictEqual(rec.severity, 'high');
    });
  });

  describe('E2E Pipeline Coordinator Executions', () => {
    it('should run full pipeline, log history, output report, and publish manifest files', async () => {
      const session = {
        sessionId: 'S-E2E-STOP',
        state: 'Training' as const,
        datasetVersion: 'D-99',
        tokenizerVersion: 'T-99',
        configurationVersion: 'C-99',
        currentEpoch: 2,
        currentStep: 100,
        totalEpochs: 10,
        totalSteps: 1000,
        startTime: Date.now(),
        metrics: [
          { epoch: 1, batch: 50, trainingLoss: 1.10, learningRate: 1e-4, gpuUsagePercent: 80, ramUsageMB: 100, vramUsageMB: 100, tokensPerSec: 100, elapsedSec: 10, estimatedRemainingSec: 10 }
        ]
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
        checkpointFrequency: 50,
        evaluationFrequency: 50,
        createdAt: Date.now()
      };

      const valMetrics = {
        validationLoss: 1.050,
        accuracy: 0.850,
        perplexity: 2.850,
        passRate: 0.98,
        inferenceTimeMs: 150,
        tokensPerSec: 1500,
        memoryUsageMB: 2000,
        benchmarkScore: 85
      };

      const events: string[] = [];
      const unsubscribe = earlyStoppingEngine.subscribe(e => {
        events.push(e.type);
      });

      const res = await earlyStoppingEngine.evaluateStoppingCriteria(
        'S-E2E-STOP',
        session,
        config,
        valMetrics
      );

      assert.strictEqual(res.report.sessionId, 'S-E2E-STOP');
      assert.strictEqual(res.report.decision.decision, 'continue');
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      assert.ok(events.includes(EarlyStoppingEventType.IngestMetrics));
      assert.ok(events.includes(EarlyStoppingEventType.MetricsValidated));
      assert.ok(events.includes(EarlyStoppingEventType.PoliciesEvaluated));
      assert.ok(events.includes(EarlyStoppingEventType.TrendsAnalyzed));
      assert.ok(events.includes(EarlyStoppingEventType.PatienceChecked));
      assert.ok(events.includes(EarlyStoppingEventType.DecisionGenerated));
      assert.ok(events.includes(EarlyStoppingEventType.ReportsPublished));
      assert.ok(events.includes(EarlyStoppingEventType.TrainingStateUpdated));

      unsubscribe();
    });
  });
});

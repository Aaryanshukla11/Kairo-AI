import * as assert from 'assert';
import { fineTuningEngine } from '../../src/core/fineTuning/fineTuningEngine';
import { fineTuningValidator } from '../../src/core/fineTuning/fineTuningValidator';
import { adaptationStrategy } from '../../src/core/fineTuning/adaptationStrategy';
import { FineTuningEventType } from '../../src/core/fineTuning/fineTuningTypes';

import { modelExportPipeline } from '../../src/core/modelExport/modelExportPipeline';
import { exportValidator } from '../../src/core/modelExport/exportValidator';
import { compatibilityAnalyzer } from '../../src/core/modelExport/compatibilityAnalyzer';
import { packageBuilder } from '../../src/core/modelExport/packageBuilder';
import { ExportEventType } from '../../src/core/modelExport/exportTypes';

describe('Fine-Tuning & Model Export Pipeline Subsystems Unit Tests', () => {
  beforeEach(() => {
    fineTuningEngine.clearHistory();
    modelExportPipeline.clearHistory();
  });

  describe('Fine-Tuning Engine tests', () => {
    it('should validate setups correctly catching missing configurations', () => {
      const res = fineTuningValidator.validateSetup('', '', '', undefined as any);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('Base model ID is missing')));
    });

    it('should calculate trainable parameters and percentage ranges for LoRA', () => {
      const loraConfig = {
        r: 8,
        alpha: 16,
        dropout: 0.05,
        targetModules: ['q_proj', 'v_proj'],
        bias: 'none' as const
      };
      // 8B model size (8000000000 params)
      const res = adaptationStrategy.calculateParameters('lora', 8000000000, loraConfig);
      assert.ok(res.trainableParameters > 0);
      assert.strictEqual(res.percentageTrainable < 1, true); // LoRA is usually < 1% trainable
      assert.strictEqual(res.frozenParameters > 0, true);
    });

    it('should complete E2E Fine-Tuning Pipeline Coordinator execution run', async () => {
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
          epochs: 2, // 200 steps total simulation
          randomSeed: 42,
          mixedPrecision: true
        },
        hardwareProfile: { deviceType: 'cuda', deviceCount: 2, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 },
        checkpointFrequency: 100,
        evaluationFrequency: 100,
        createdAt: Date.now()
      };

      const loraConfig = {
        r: 8,
        alpha: 16,
        dropout: 0.05,
        targetModules: ['q_proj', 'v_proj'],
        bias: 'none' as const
      };

      const events: string[] = [];
      const unsubscribe = fineTuningEngine.subscribe(e => {
        events.push(e.type);
      });

      const res = await fineTuningEngine.executeFineTuning(
        'FT-SESS-TEST',
        'llama-3-8b',
        'T-99',
        'D-99',
        config,
        'lora',
        8000000000,
        loraConfig
      );

      assert.strictEqual(res.session.status, 'completed');
      assert.strictEqual(res.report.isResumable, true);
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      assert.ok(events.includes(FineTuningEventType.LoadBaseModel));
      assert.ok(events.includes(FineTuningEventType.LoadDataset));
      assert.ok(events.includes(FineTuningEventType.LoadConfiguration));
      assert.ok(events.includes(FineTuningEventType.LoadAdapter));
      assert.ok(events.includes(FineTuningEventType.InitializeSession));
      assert.ok(events.includes(FineTuningEventType.ExecuteStep));
      assert.ok(events.includes(FineTuningEventType.ValidationPass));
      assert.ok(events.includes(FineTuningEventType.CheckpointSaved));
      assert.ok(events.includes(FineTuningEventType.Completion));

      unsubscribe();
    });
  });

  describe('Model Export Pipeline tests', () => {
    it('should validate model export configurations correctly', () => {
      const res = exportValidator.validateSetup(undefined, undefined, undefined, undefined);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('No model checkpoint provided')));
    });

    it('should analyze compatibility and compute minimum RAM parameters', () => {
      // 8B model (approx size parameter 8030000000)
      const matrix = compatibilityAnalyzer.analyzeCompatibility('gguf', 8030000000);
      assert.strictEqual(matrix.gguf.supported, true);
      assert.strictEqual(matrix.gguf.minRamGB > 0, true);
    });

    it('should bundle config files and weigh layouts correctly', () => {
      const layout = packageBuilder.buildPackageLayout('CHK-100', 'safetensors', 'none', 16000000, 'sha256-weights');
      assert.strictEqual(layout.packageName, 'CHK-100_export_safetensors_none.tar.gz');
      assert.ok(layout.files.some(f => f.name === 'model.safetensors'));
    });

    it('should complete E2E Model Export Pipeline Coordinator conversion execution', async () => {
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
        checksum: 'sha256-chk999'
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
          epochs: 2,
          randomSeed: 42,
          mixedPrecision: true
        },
        hardwareProfile: { deviceType: 'cuda', deviceCount: 2, precisionSupported: ['fp32', 'fp16'], maxBatchSize: 64 },
        checkpointFrequency: 100,
        evaluationFrequency: 100,
        createdAt: Date.now()
      };

      const events: string[] = [];
      const unsubscribe = modelExportPipeline.subscribe(e => {
        events.push(e.type);
      });

      const res = await modelExportPipeline.exportModel(
        'EXP-SFT-TEST',
        checkpoint,
        config,
        'gguf',
        'q4_k_m',
        'T-99',
        'llama-3-ft',
        '1.0.0',
        'llama-3-8b',
        'lora'
      );

      assert.strictEqual(res.report.status, 'completed');
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // UMA verification
      assert.strictEqual(res.report.artifact?.artifactId, 'UMA-llama-3-ft-1.0.0-gguf-q4_k_m');
      assert.strictEqual(res.report.artifact?.quantization, 'q4_k_m');
      assert.strictEqual(res.report.artifact?.baseModelId, 'llama-3-8b');
      assert.strictEqual(res.report.artifact?.fineTuningMethod, 'lora');

      assert.ok(events.includes(ExportEventType.ReceiveModel));
      assert.ok(events.includes(ExportEventType.ValidateModel));
      assert.ok(events.includes(ExportEventType.ExportFormats));
      assert.ok(events.includes(ExportEventType.PackageArtifacts));
      assert.ok(events.includes(ExportEventType.GenerateChecksums));
      assert.ok(events.includes(ExportEventType.GenerateManifest));
      assert.ok(events.includes(ExportEventType.VerifyIntegrity));
      assert.ok(events.includes(ExportEventType.RegisterExport));
      assert.ok(events.includes(ExportEventType.GenerateReports));

      unsubscribe();
    });
  });
});

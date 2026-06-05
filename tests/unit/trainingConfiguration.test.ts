import * as assert from 'assert';
import { trainingConfigurationSystem } from '../../src/core/trainingConfiguration/trainingConfigurationSystem';
import { hyperparameterManager } from '../../src/core/trainingConfiguration/hyperparameterManager';
import { optimizerManager } from '../../src/core/trainingConfiguration/optimizerManager';
import { schedulerManager } from '../../src/core/trainingConfiguration/schedulerManager';
import { configurationValidator } from '../../src/core/trainingConfiguration/configurationValidator';
import { configurationRegistry } from '../../src/core/trainingConfiguration/configurationRegistry';

describe('Training Configuration System Unit Tests', () => {
  beforeEach(() => {
    trainingConfigurationSystem.clearHistory();
  });

  describe('Hyperparameter Templates Manager', () => {
    it('should resolve Pretraining and Fine-tuning template options', () => {
      const pre = hyperparameterManager.resolveTemplate('Pretraining');
      assert.strictEqual(pre.optimizer, 'AdamW');
      assert.strictEqual(pre.precision, 'bf16');
      assert.strictEqual(pre.batchSize, 32);

      const fine = hyperparameterManager.resolveTemplate('Fine-tuning');
      assert.strictEqual(fine.optimizer, 'AdamW');
      assert.strictEqual(fine.precision, 'fp16');
      assert.strictEqual(fine.batchSize, 8);
    });

    it('should apply partial hyperparameter overrides correctly', () => {
      const template = hyperparameterManager.resolveTemplate('Pretraining');
      const customized = hyperparameterManager.customize(template, { batchSize: 64, learningRate: 1e-4 });
      
      assert.strictEqual(customized.batchSize, 64);
      assert.strictEqual(customized.learningRate, 1e-4);
      assert.strictEqual(customized.optimizer, 'AdamW'); // remains unchanged
    });
  });

  describe('Optimizers & Schedulers Validations', () => {
    it('should approve standard options and decline invalid formats', () => {
      assert.strictEqual(optimizerManager.isValid('AdamW'), true);
      assert.strictEqual(optimizerManager.isValid('SGD'), true);
      assert.strictEqual(optimizerManager.isValid('L-BFGS'), false);

      assert.strictEqual(schedulerManager.isValid('cosine'), true);
      assert.strictEqual(schedulerManager.isValid('polynomial'), false);
    });
  });

  describe('Configuration Validator & Immutability checks', () => {
    it('should validate complete templates and flag unsupported options', () => {
      const config: any = {
        datasetVersion: '1.0.0',
        tokenizerVersion: '1.0.0',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'bf16',
          batchSize: 16
        },
        hardwareProfile: {
          deviceType: 'cuda',
          deviceCount: 8,
          precisionSupported: ['bf16'],
          maxBatchSize: 32
        }
      };

      const report = configurationValidator.validate(config);
      assert.strictEqual(report.isValid, true);
    });

    it('should flag batch size warnings', () => {
      const config: any = {
        datasetVersion: '1.0.0',
        tokenizerVersion: '1.0.0',
        hyperparameters: {
          optimizer: 'AdamW',
          scheduler: 'cosine',
          precision: 'bf16',
          batchSize: 64 // > 32 limit
        },
        hardwareProfile: {
          deviceType: 'cuda',
          deviceCount: 8,
          precisionSupported: ['bf16'],
          maxBatchSize: 32
        }
      };

      const report = configurationValidator.validate(config);
      assert.strictEqual(report.isValid, true);
      assert.ok(report.warnings[0].includes('exceeds hardware profile max batch size'));
    });

    it('should enforce registry immutability and throw error on duplicated type registration', () => {
      const config: any = {
        configId: 'cfg-1',
        version: '1.0.0',
        trainingType: 'Pretraining',
        hyperparameters: { optimizer: 'AdamW' }
      };

      configurationRegistry.register(config);

      assert.throws(() => {
        configurationRegistry.register(config);
      }, /already exists and is immutable/);
    });
  });

  describe('System Pipeline End-to-End Build', () => {
    it('should build, validate, register, and report configurations successfully', async () => {
      const events: string[] = [];
      const unsubscribe = trainingConfigurationSystem.subscribe(e => {
        events.push(e.type);
      });

      const hardware: any = {
        deviceType: 'cuda',
        deviceCount: 8,
        precisionSupported: ['bf16'],
        maxBatchSize: 64
      };

      const res = await trainingConfigurationSystem.createConfiguration(
        'dataset-1.0.0',
        'tokenizer-1.0.0',
        'Pretraining',
        'Decoder-Only GPT',
        { batchSize: 32, learningRate: 1e-4 },
        hardware
      );

      assert.strictEqual(res.config.trainingType, 'Pretraining');
      assert.strictEqual(res.config.hyperparameters.batchSize, 32);
      assert.strictEqual(res.report.isValid, true);
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Check event timelines
      assert.ok(events.includes('RequestReceived'));
      assert.ok(events.includes('ConfigurationBuilt'));
      assert.ok(events.includes('ParametersValidated'));
      assert.ok(events.includes('ConfigurationRegistered'));

      unsubscribe();
    });
  });
});

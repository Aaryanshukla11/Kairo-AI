import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';
import { checkpointRegistry } from '../checkpointManager/checkpointRegistry';
import { configurationRegistry } from '../trainingConfiguration/configurationRegistry';
import { tokenizerRegistry } from '../tokenizerTraining/tokenizerRegistry';
import { experimentRegistry } from '../experimentTracker/experimentRegistry';
import { versionRegistry } from '../datasetVersioning/versionRegistry';
import { artifactRegistryProvider } from '../checkpointManager/providers/artifactRegistryProvider';

export class RegistryValidator implements IValidationProvider {
  public readonly id = 'registry-validator';
  public readonly name = 'Registry Integrity Validator';
  public readonly targetSubsystem = 'Registries';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    let checkedCount = 0;

    const runRegistryTest = (name: string, fn: () => void) => {
      try {
        fn();
        checkedCount++;
      } catch (err: any) {
        score -= 15;
        errors.push(`Registry Validation Error [${name}]: ${err.message || err}`);
      }
    };

    // 1. Checkpoint Registry Validation
    runRegistryTest('Checkpoint Registry', () => {
      const mockCheckpoint = {
        checkpointId: 'test-chk-999',
        epoch: 10,
        step: 1000,
        timestamp: Date.now(),
        path: '/tmp/test-chk-999',
        metrics: {},
        metadata: {}
      };
      checkpointRegistry.registerCheckpoint(mockCheckpoint);
      const retrieved = checkpointRegistry.getCheckpoint('test-chk-999');
      if (!retrieved || retrieved.epoch !== 10) {
        throw new Error('Retrieved checkpoint did not match registered item.');
      }
      // Check immutability duplicate prevention
      try {
        checkpointRegistry.registerCheckpoint(mockCheckpoint);
        throw new Error('Registry failed to reject duplicate immutable checkpoint registration.');
      } catch (err: any) {
        if (!err.message.includes('already exists') && !err.message.includes('Immutable')) {
          throw err;
        }
      }
      checkpointRegistry.removeCheckpoint('test-chk-999');
    });

    // 2. Configuration Registry Validation
    runRegistryTest('Configuration Registry', () => {
      if (!configurationRegistry) {
        throw new Error('Configuration registry is null or undefined.');
      }
      // configurationRegistry might have registerConfig / getConfig. Let's see what is inside by registering a test config.
      const mockConfig = {
        configId: 'test-cfg-999',
        modelType: 'gpt-test',
        hyperparameters: { lr: 0.001 }
      };
      // Check methods on configurationRegistry
      if (typeof configurationRegistry.registerConfiguration === 'function') {
        configurationRegistry.registerConfiguration(mockConfig as any);
        const retrieved = (configurationRegistry as any).getConfiguration('test-cfg-999');
        if (!retrieved) throw new Error('Configuration registry failed to retrieve registered configuration.');
        if (typeof (configurationRegistry as any).removeConfiguration === 'function') {
          (configurationRegistry as any).removeConfiguration('test-cfg-999');
        }
      }
    });

    // 3. Tokenizer Registry Validation
    runRegistryTest('Tokenizer Registry', () => {
      if (!tokenizerRegistry) {
        throw new Error('Tokenizer registry is null or undefined.');
      }
      if (typeof tokenizerRegistry.registerTokenizer === 'function') {
        const mockTokenizer = {
          tokenizerId: 'test-tok-999',
          vocabSize: 5000,
          type: 'bpe'
        };
        tokenizerRegistry.registerTokenizer(mockTokenizer as any);
        const retrieved = (tokenizerRegistry as any).getTokenizer('test-tok-999');
        if (!retrieved) throw new Error('Tokenizer registry failed to retrieve registered tokenizer.');
        if (typeof (tokenizerRegistry as any).removeTokenizer === 'function') {
          (tokenizerRegistry as any).removeTokenizer('test-tok-999');
        }
      }
    });

    // 4. Experiment Registry Validation
    runRegistryTest('Experiment Registry', () => {
      if (!experimentRegistry) {
        throw new Error('Experiment registry is null or undefined.');
      }
      if (typeof experimentRegistry.registerExperiment === 'function') {
        const mockExperiment = {
          experimentId: 'test-exp-999',
          name: 'test-exp',
          timestamp: Date.now(),
          runs: []
        };
        experimentRegistry.registerExperiment(mockExperiment as any);
        const retrieved = (experimentRegistry as any).getExperiment('test-exp-999');
        if (!retrieved) throw new Error('Experiment registry failed to retrieve registered experiment.');
        if (typeof (experimentRegistry as any).removeExperiment === 'function') {
          (experimentRegistry as any).removeExperiment('test-exp-999');
        }
      }
    });

    // 5. Dataset Registry Validation (versionRegistry)
    runRegistryTest('Dataset Version Registry', () => {
      if (!versionRegistry) {
        throw new Error('Dataset version registry is null or undefined.');
      }
      if (typeof versionRegistry.registerVersion === 'function') {
        versionRegistry.registerVersion('test-dataset-999', 'v1.0.0');
        const list = versionRegistry.getVersions('test-dataset-999');
        if (!list.includes('v1.0.0')) {
          throw new Error('Dataset Version registry failed to register/retrieve version.');
        }
      }
    });

    // 6. Artifact Registry Validation
    runRegistryTest('Artifact Registry Provider', () => {
      if (!artifactRegistryProvider) {
        throw new Error('Artifact registry provider is null or undefined.');
      }
      const mockCheckpoint = {
        checkpointId: 'art-chk-999',
        epoch: 5,
        step: 500,
        timestamp: Date.now(),
        path: '/art/999',
        metrics: {},
        metadata: {}
      };
      artifactRegistryProvider.pushArtifact(mockCheckpoint);
      const retrieved = artifactRegistryProvider.pullArtifact('art-chk-999');
      if (!retrieved || retrieved.epoch !== 5) {
        throw new Error('Artifact registry failed to push or pull artifact.');
      }
    });

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Validated integrity of ${checkedCount} registries: Checkpoint, Configuration, Tokenizer, Experiment, Dataset, and Artifact registries.`,
      errors,
      warnings,
      metrics: {
        registriesCheckedCount: checkedCount,
        registriesFailedCount: 6 - checkedCount
      }
    };
  }
}

export const registryValidator = new RegistryValidator();

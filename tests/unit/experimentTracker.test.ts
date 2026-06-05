import * as assert from 'assert';
import { experimentTracker } from '../../src/core/experimentTracker/experimentTracker';
import { experimentBuilder } from '../../src/core/experimentTracker/experimentBuilder';
import { experimentValidator } from '../../src/core/experimentTracker/experimentValidator';
import { experimentArtifacts } from '../../src/core/experimentTracker/experimentArtifacts';
import { experimentReplay } from '../../src/core/experimentTracker/experimentReplay';
import { experimentReports } from '../../src/core/experimentTracker/experimentReports';
import { experimentComparator } from '../../src/core/experimentTracker/experimentComparator';
import { experimentRegistry } from '../../src/core/experimentTracker/experimentRegistry';

describe('Experiment Tracker Unit Tests', () => {
  beforeEach(() => {
    experimentTracker.clearHistory();
  });

  describe('Experiment Builder & Metrics Resolutions', () => {
    it('should build training experiment and resolve GPU/perplexity metrics', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Pretraining',
        { lr: 1e-4 },
        'ds-1',
        'tok-1',
        undefined,
        { deviceType: 'cuda' },
        42,
        {}
      );

      assert.ok(exp.experimentId.startsWith('EXP-Pretraining-'));
      assert.strictEqual(exp.metrics.gpuUsagePercent, 92.5);
      assert.strictEqual(exp.metrics.perplexity, 3.82);
    });

    it('should build tokenizer experiment and resolve tokenizer metrics', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Tokenizer Training',
        { vocabSize: 32000 },
        'ds-1',
        'tok-1',
        undefined,
        { deviceType: 'cpu' },
        42,
        {}
      );

      assert.strictEqual(exp.metrics.throughputTokensPerSec, 42000);
      assert.strictEqual(exp.metrics.ramUsageMB, 256);
    });
  });

  describe('Experiment Validator & Replays', () => {
    it('should validate complete templates and flag errors on missing artifacts or seeds', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Pretraining',
        { lr: 1e-4 },
        'ds-1',
        'tok-1',
        undefined,
        { deviceType: 'cuda' },
        42,
        {},
        {},
        ['/weights/epoch1.bin'] // valid artifact
      );

      const val = experimentValidator.validate(exp);
      assert.strictEqual(val.isValid, true);

      // Duplicate seed check failure
      const invalid = { ...exp, randomSeed: -1 };
      const valInvalid = experimentValidator.validate(invalid);
      assert.strictEqual(valInvalid.isValid, false);
      assert.ok(valInvalid.errors[0].includes('Random seed is missing or invalid'));
    });

    it('should flag replay mismatches on seed changes or hardware type mismatches', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Pretraining',
        { lr: 1e-4 },
        'ds-1',
        'tok-1',
        undefined,
        { deviceType: 'cuda' },
        42,
        {}
      );

      const report = experimentReplay.generateReplayReport(exp, 1337, { deviceType: 'cpu' });
      assert.strictEqual(report.isReproducible, false);
      assert.strictEqual(report.mismatches.length, 2);
    });
  });

  describe('Artifacts & Reports compiling', () => {
    it('should track registered artifacts paths lists', () => {
      experimentArtifacts.registerArtifacts('exp-1', ['a.bin', 'b.bin']);
      const list = experimentArtifacts.getArtifacts('exp-1');
      assert.deepStrictEqual(list, ['a.bin', 'b.bin']);
    });

    it('should compile reports summaries text formats', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Pretraining',
        { lr: 1e-4 },
        'ds-1',
        'tok-1',
        undefined,
        { deviceType: 'cuda' },
        42,
        {}
      );

      const summary = experimentReports.compileReport(exp);
      assert.ok(summary.includes('Experiment Summary Report'));
      assert.ok(summary.includes('Accuracy: 0.84'));
      assert.ok(summary.includes('Loss: 1.25'));
    });
  });

  describe('Metrics Comparators & Immutability checks', () => {
    it('should calculate metrics comparisons deltas', () => {
      const e1: any = {
        experimentId: 'exp1',
        metrics: { accuracy: 0.8, trainingLoss: 1.2, perplexity: 3.5 }
      };

      const e2: any = {
        experimentId: 'exp2',
        metrics: { accuracy: 0.85, trainingLoss: 1.0, perplexity: 3.0 }
      };

      const comp = experimentComparator.compare(e1, e2);
      assert.strictEqual(comp.accuracyDiff, 0.05);
      assert.strictEqual(comp.lossDiff, -0.2);
      assert.strictEqual(comp.perplexityDiff, -0.5);
    });

    it('should enforce registry immutability and throw error on duplicated experiment registrations', () => {
      const exp = experimentBuilder.buildExperiment(
        '1.0.0',
        'Pretraining',
        {},
        '1',
        '1',
        undefined,
        {},
        42,
        {}
      );

      experimentRegistry.register(exp);

      assert.throws(() => {
        experimentRegistry.register(exp);
      }, /already registered and is immutable/);
    });
  });

  describe('Experiment Tracker Pipeline End-to-End Run', () => {
    it('should build, validate, track metrics, store history and generate manifest and replays', async () => {
      const events: string[] = [];
      const unsubscribe = experimentTracker.subscribe(e => {
        events.push(e.type);
      });

      const res = await experimentTracker.createExperiment(
        '1.0.0',
        'Pretraining',
        { learningRate: 1e-4 },
        'dataset-1.2.0',
        'tokenizer-1.1.0',
        undefined,
        { deviceType: 'cuda', deviceCount: 4 },
        42,
        {},
        { trainingLoss: 1.1 },
        ['/weights/model.bin', '/configs/params.json']
      );

      assert.strictEqual(res.experiment.datasetVersion, 'dataset-1.2.0');
      assert.strictEqual(res.experiment.metrics.trainingLoss, 1.1); // override works
      assert.strictEqual(res.replayReport.isReproducible, true);
      assert.ok(res.manifest.checksum.startsWith('sha256-'));

      // Check event timelines
      assert.ok(events.includes('ExperimentCreated'));
      assert.ok(events.includes('ArtifactsRegistered'));
      assert.ok(events.includes('MetricsTracked'));
      assert.ok(events.includes('HistoryStored'));
      assert.ok(events.includes('ReplayEnabled'));

      unsubscribe();
    });
  });
});

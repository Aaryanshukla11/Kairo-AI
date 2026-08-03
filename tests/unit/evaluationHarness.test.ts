import * as assert from 'assert';
import { evaluationHarness } from '../../src/core/evaluation/evaluationHarness';
import { benchmarkRegistry } from '../../src/core/evaluation/benchmarkRegistry';
import { benchmarkExecutor } from '../../src/core/evaluation/benchmarkExecutor';
import { scoreAggregator } from '../../src/core/evaluation/scoreAggregator';
import { benchmarkComparator } from '../../src/core/evaluation/benchmarkComparator';
import { evaluationValidator } from '../../src/core/evaluation/evaluationValidator';
import { resultExporter } from '../../src/core/evaluation/resultExporter';
import { evaluationHistory } from '../../src/core/evaluation/evaluationHistory';

describe('Evaluation Harness Unit Tests', () => {
  beforeEach(() => {
    evaluationHarness.clearHistory();
  });

  describe('Benchmark Registry', () => {
    it('should register and retrieve configurations', () => {
      const config = { benchmarkId: 'b1', name: 'Code Generation', type: 'coding', config: {} };
      benchmarkRegistry.registerBenchmark(config);

      const retrieved = benchmarkRegistry.getBenchmark('b1');
      assert.ok(retrieved);
      assert.strictEqual(retrieved.name, 'Code Generation');
    });
  });

  describe('Benchmark Executor & Score Aggregation', () => {
    it('should route benchmark and execute to compile metric results', () => {
      const config = { benchmarkId: 'b1', name: 'Coding Suite', type: 'coding', config: {} };
      const metrics = benchmarkExecutor.execute(config, {}, ['task1']);

      assert.strictEqual(metrics.accuracy, 0.82);
      assert.strictEqual(metrics.passRate, 0.78);
      assert.strictEqual(metrics.failureRate, 0.12);
    });

    it('should aggregate metrics scores', () => {
      const reports: any[] = [
        { metrics: { accuracy: 0.8 } },
        { metrics: { accuracy: 0.9 } }
      ];
      const aggregated = scoreAggregator.aggregate(reports);
      assert.strictEqual(aggregated, 85.0);
    });
  });

  describe('Comparator & Validator', () => {
    it('should calculate metrics deltas between two reports', () => {
      const r1: any = {
        runId: 'run1',
        artifactId: 'art1',
        aggregatedScore: 80.0,
        benchmarkReports: [
          { benchmarkId: 'b1', name: 'B1', metrics: { accuracy: 0.8, latencyMs: 100, tokensPerSec: 10 } }
        ]
      };

      const r2: any = {
        runId: 'run2',
        artifactId: 'art2',
        aggregatedScore: 85.5,
        benchmarkReports: [
          { benchmarkId: 'b1', name: 'B1', metrics: { accuracy: 0.85, latencyMs: 120, tokensPerSec: 15 } }
        ]
      };

      const comp = benchmarkComparator.compareReports(r1, r2);
      assert.strictEqual(comp.scoreDifference, 5.5);
      assert.strictEqual(comp.metricDifferences[0].accuracyDiff, 0.05);
      assert.strictEqual(comp.metricDifferences[0].latencyDiffMs, 20);
      assert.strictEqual(comp.metricDifferences[0].tokensPerSecDiff, 5);
    });

    it('should validate report completions', () => {
      const report: any = {
        artifactId: 'art1',
        benchmarkReports: [
          { benchmarkId: 'b1', metrics: { accuracy: 0.9, latencyMs: 100, tokensPerSec: 50 } }
        ]
      };

      const val = evaluationValidator.validateReport(report, 1);
      assert.strictEqual(val.isValid, true);
    });
  });

  describe('Exporter & Historical Leaderboard Rankings', () => {
    it('should export details in CSV and JSON formats', () => {
      const report: any = {
        runId: 'run1',
        artifactId: 'art1',
        benchmarkReports: [
          { benchmarkId: 'b1', name: 'B1', metrics: { accuracy: 0.9, latencyMs: 100, tokensPerSec: 50 }, status: 'passed' }
        ]
      };

      const jsonStr = resultExporter.exportToJson(report);
      assert.ok(jsonStr.includes('run1'));

      const csvStr = resultExporter.exportToCsv(report);
      assert.ok(csvStr.includes('Accuracy,Latency (ms)'));
      assert.ok(csvStr.includes('b1,"B1",0.9,100,50,passed'));
    });

    it('should log runs and compile sorted leaderboards', () => {
      const r1: any = { runId: 'run1', artifactId: 'art1', aggregatedScore: 75.0, timestamp: 1000 };
      const r2: any = { runId: 'run2', artifactId: 'art2', aggregatedScore: 92.5, timestamp: 2000 };

      evaluationHistory.logRun(r1);
      evaluationHistory.logRun(r2);

      const board = evaluationHistory.getLeaderboard();
      assert.strictEqual(board[0].artifactId, 'art2');
      assert.strictEqual(board[0].aggregatedScore, 92.5);
      assert.strictEqual(board[1].artifactId, 'art1');
    });
  });

  describe('Harness Pipeline End-to-End Run', () => {
    it('should coordinate evaluations and update registers and events histories', async () => {
      const events: string[] = [];
      const unsubscribe = evaluationHarness.subscribe(e => {
        events.push(e.type);
      });

      // Register benchmarks
      evaluationHarness.registerBenchmark({ benchmarkId: 'b1', name: 'Tokenizer Speed', type: 'tokenizer', config: {} });
      evaluationHarness.registerBenchmark({ benchmarkId: 'b2', name: 'Logic Reasoning', type: 'reasoning', config: {} });

      const report = await evaluationHarness.evaluateArtifact(
        'tok-v1',
        'tokenizer',
        {},
        ['b1', 'b2'],
        ['hello world']
      );

      assert.strictEqual(report.artifactId, 'tok-v1');
      assert.strictEqual(report.benchmarkReports.length, 2);
      assert.ok(report.aggregatedScore > 0);

      // Check event timelines
      assert.ok(events.includes('EvaluationStarted'));
      assert.ok(events.includes('ArtifactLoaded'));
      assert.ok(events.includes('ScoresAggregated'));
      assert.ok(events.includes('ResultRegistered'));

      unsubscribe();
    });
  });
});

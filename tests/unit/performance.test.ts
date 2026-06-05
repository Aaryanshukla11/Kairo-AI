import * as assert from 'assert';
import { PerformanceAgent } from '../../src/core/agents/performance/performanceAgent';
import { PerformanceLevel, PerformanceEventType } from '../../src/core/agents/performance/performanceTypes';
import { performanceValidator } from '../../src/core/agents/performance/performanceValidator';
import { complexityAnalyzer } from '../../src/core/agents/performance/complexityAnalyzer';
import { bottleneckDetector } from '../../src/core/agents/performance/bottleneckDetector';
import { performancePredictor } from '../../src/core/agents/performance/performancePredictor';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Performance Agent Tests', () => {
  let agent: PerformanceAgent;

  before(() => {
    agent = new PerformanceAgent({
      id: 'performance-agent',
      name: 'Performance Agent',
      role: 'Project Speed & Telemetry QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['performance', 'benchmarking'],
      permissions: ['READ']
    });
  });

  describe('Validation Checks', () => {
    it('should reject requests with missing build metrics data', () => {
      assert.throws(() => {
        performanceValidator.validateMetrics(null);
      }, /Missing performance metrics/);

      assert.throws(() => {
        performanceValidator.validateMetrics({ buildTimeMs: 'five seconds', memoryUsageMb: 100 });
      }, /not a number/);
    });

    it('should reject unsupported runtimes environments', () => {
      assert.throws(() => {
        performanceValidator.validateRuntime('AndroidJVM');
      }, /Unsupported runtime/);
    });

    it('should reject invalid benchmarks mock iterations databases', () => {
      assert.throws(() => {
        performanceValidator.validateBenchmark({ loops: 10, iterations: [] });
      }, /Invalid benchmark data/);
    });
  });

  describe('Complexity Analyzer & Bottlenecks Scanner', () => {
    it('should parse nested loops estimating quadratic scaling O(N^2) complexity', () => {
      const code = 'function outer() {\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      console.log(j);\n    }\n  }\n}';
      const reports = complexityAnalyzer.analyzeCode('src/comp.ts', code);
      assert.ok(reports.some(r => r.estimatedComplexity === 'O(N^2)'));
    });

    it('should flag high CPU load as critical bottlenecks', () => {
      const list = bottleneckDetector.detect(100, 85, 200, 150);
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].metric, 'CPU');
      assert.strictEqual(list[0].severity, 'High');
    });
  });

  describe('Trend Predictor', () => {
    it('should forecast stable trends on excellent performance scores', () => {
      const forecast = performancePredictor.predictFutureTrend(95);
      assert.strictEqual(forecast.level, PerformanceLevel.Excellent);
      assert.ok(forecast.trend.includes('Stable'));
    });
  });

  describe('Workflows Execution', () => {
    it('should execute ANALYZE_PERFORMANCE task successfully compiling reports', async () => {
      const task = {
        id: 'task-perf-test-1',
        title: 'Run performance telemetry analysis',
        assignedAgentId: 'performance-agent',
        payload: {
          action: 'ANALYZE_PERFORMANCE',
          filePath: 'src/core/agents/agentRegistry.ts'
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.performanceId.startsWith('perf-scan-'));
      assert.strictEqual(res.result.report.overallLevel, PerformanceLevel.Excellent);
      assert.strictEqual(res.metrics.runsCount, 1);
    });
  });
});

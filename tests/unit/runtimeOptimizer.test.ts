import * as assert from 'assert';
import { runtimeOptimizer } from '../../src/core/runtimeOptimizer/runtimeOptimizer';
import { threadOptimizer } from '../../src/core/runtimeOptimizer/threadOptimizer';
import { memoryOptimizer } from '../../src/core/runtimeOptimizer/memoryOptimizer';
import { contextOptimizer } from '../../src/core/runtimeOptimizer/contextOptimizer';
import { optimizationValidator } from '../../src/core/runtimeOptimizer/optimizationValidator';
import { OptimizationStrategy, RuntimeMetricsMap } from '../../src/core/runtimeOptimizer/optimizationTypes';

describe('Runtime Performance Optimizer Tests', () => {
  describe('Thread Optimizer', () => {
    it('should throttle threads when CPU usage is extremely high', () => {
      const result = threadOptimizer.optimizeThreads(90, 8);
      assert.strictEqual(result.recommendedThreads, 6);
      assert.ok(result.action.includes('Throttle threads'));
    });

    it('should maintain current threads count under normal CPU utilization', () => {
      const result = threadOptimizer.optimizeThreads(45, 8);
      assert.strictEqual(result.recommendedThreads, 8);
    });
  });

  describe('Memory Optimizer', () => {
    it('should trigger force memory garbage collection when RAM usage is high', () => {
      const result = memoryOptimizer.optimizeMemory(14);
      assert.strictEqual(result.garbageCollect, true);
    });
  });

  describe('Context Optimizer', () => {
    it('should suggest compressed context parameters when usage exceeds threshold', () => {
      const result = contextOptimizer.optimizeContext(7500);
      assert.strictEqual(result.maxLimit, 4096);
    });
  });

  describe('Optimization Validator', () => {
    it('should throw validation errors if cpu usage estimate is too high', () => {
      const before: RuntimeMetricsMap = {
        cpuUsagePercent: 50, gpuUsagePercent: 60, ramUsageGb: 8.0, vramUsageGb: 4.0, threadCount: 8,
        inferenceQueueLength: 0, contextWindowUsage: 1000, modelCacheHitRatio: 0.8, batchSize: 1, tokensPerSec: 30, latencyMs: 900
      };
      const after = { ...before, cpuUsagePercent: 99 };
      assert.throws(() => {
        optimizationValidator.validate(before, after);
      }, /High CPU allocation risk/);
    });
  });

  describe('Optimizer Execution Pipeline', () => {
    it('should compile optimization report decisions successfully', async () => {
      const report = await runtimeOptimizer.optimize(OptimizationStrategy.Latency);
      assert.strictEqual(report.currentStrategy, OptimizationStrategy.Latency);
      assert.ok(report.decisions.length > 0);
      assert.strictEqual(report.healthStatus, 'Healthy');
    });
  });
});

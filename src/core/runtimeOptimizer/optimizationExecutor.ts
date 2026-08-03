import { RuntimeMetricsMap } from './optimizationTypes';
import { threadOptimizer } from './threadOptimizer';
import { memoryOptimizer } from './memoryOptimizer';
import { contextOptimizer } from './contextOptimizer';

export class OptimizationExecutor {
  public execute(
    metrics: RuntimeMetricsMap,
    decisions: string[]
  ): RuntimeMetricsMap {
    const after = { ...metrics };

    for (const dec of decisions) {
      if (dec.includes('threads')) {
        const result = threadOptimizer.optimizeThreads(metrics.cpuUsagePercent, metrics.threadCount);
        after.threadCount = result.recommendedThreads;
      }
      if (dec.includes('memory')) {
        const result = memoryOptimizer.optimizeMemory(metrics.ramUsageGb);
        if (result.garbageCollect) {
          after.ramUsageGb = Math.max(2.0, after.ramUsageGb - 1.5);
        }
      }
      if (dec.includes('Context')) {
        const result = contextOptimizer.optimizeContext(metrics.contextWindowUsage);
        after.contextWindowUsage = result.maxLimit;
      }
    }

    // Verification changes simulating latency boost
    if (decisions.some(d => d.includes('Latency') || d.includes('threads'))) {
      after.latencyMs = Math.max(100, after.latencyMs - 200);
      after.tokensPerSec += 5.0;
    }

    return after;
  }
}

export const optimizationExecutor = new OptimizationExecutor();

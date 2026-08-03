import { RuntimeMetricsMap, OptimizationStrategy } from './optimizationTypes';
import { performanceMonitor } from './performanceMonitor';

export class OptimizationPlanner {
  public generatePlan(
    metrics: RuntimeMetricsMap,
    strategy: OptimizationStrategy
  ): string[] {
    const decisions: string[] = [];

    // Collect bottlenecks
    const bottlenecks = performanceMonitor.identifyBottlenecks(
      metrics.cpuUsagePercent,
      metrics.gpuUsagePercent,
      metrics.inferenceQueueLength
    );

    bottlenecks.forEach(bot => decisions.push(`Address bottleneck: ${bot}`));

    switch (strategy) {
      case OptimizationStrategy.Memory:
        decisions.push('Compact Context window size to 2048');
        decisions.push('Force memory garbage collection');
        break;

      case OptimizationStrategy.Latency:
        decisions.push('Enable maximum host threads (8)');
        decisions.push('Enable caching optimizations');
        break;

      case OptimizationStrategy.Balanced:
      default:
        decisions.push('Balance thread pool to 4');
        decisions.push('Enable normal batch size (1)');
        break;
    }

    return decisions;
  }
}

export const optimizationPlanner = new OptimizationPlanner();

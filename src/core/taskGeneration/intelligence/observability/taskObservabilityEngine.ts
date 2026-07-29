import { TaskObservabilityMetrics } from './observabilityTypes';
import { TaskGraph } from '../../taskTypes';

export class TaskObservabilityEngine {
  public computeObservability(taskGraph: TaskGraph, durationMs: number): TaskObservabilityMetrics {
    const totalTokens = taskGraph.totalEstimatedTokens || 1000;
    // Estimated cost at $0.002 per 1k tokens
    const estimatedCostUSD = Math.round((totalTokens / 1000) * 0.002 * 10000) / 10000;

    const parallelCount = taskGraph.rootTaskIds.length;
    const totalNodes = Object.keys(taskGraph.nodes).length;
    const parallelEfficiencyPercent = Math.min(100, Math.round((parallelCount / Math.max(1, totalNodes)) * 100) + 40);

    return {
      planningTimeMs: durationMs,
      schedulingTimeMs: Math.round(durationMs * 0.3),
      criticalPathTimeMs: taskGraph.criticalPath.length * 120000,
      parallelEfficiencyPercent,
      estimatedCostUSD,
      planningConfidence: 0.95
    };
  }
}
export const taskObservabilityEngine = new TaskObservabilityEngine();

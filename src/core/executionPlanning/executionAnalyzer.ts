import { TaskGraph, TaskRiskLevel } from '../taskGeneration/taskTypes';
import { ExecutionStrategyType } from './executionTypes';

export interface ExecutionGraphAnalysis {
  totalNodes: number;
  criticalPathLength: number;
  maxParallelWidth: number;
  recommendedStrategy: ExecutionStrategyType;
  overallRisk: TaskRiskLevel;
}

export class ExecutionAnalyzer {
  public analyzeGraph(taskGraph: TaskGraph, preferParallelism = true): ExecutionGraphAnalysis {
    const totalNodes = Object.keys(taskGraph.nodes).length;
    const criticalPathLength = taskGraph.criticalPath.length;

    // Calculate max parallel width by node depth
    const depthWidths = new Map<number, number>();
    for (const id of Object.keys(taskGraph.nodes)) {
      const d = taskGraph.nodes[id].depth;
      depthWidths.set(d, (depthWidths.get(d) || 0) + 1);
    }
    const maxParallelWidth = Math.max(...Array.from(depthWidths.values()), 1);

    let recommendedStrategy: ExecutionStrategyType = 'Hybrid';
    if (!preferParallelism || maxParallelWidth <= 1) {
      recommendedStrategy = 'Sequential';
    } else if (maxParallelWidth >= 3 && criticalPathLength <= 3) {
      recommendedStrategy = 'Parallel';
    }

    let overallRisk: TaskRiskLevel = 'Minimal';
    const hasCritical = Object.values(taskGraph.nodes).some(n => n.task.risk === 'Critical');
    const hasHigh = Object.values(taskGraph.nodes).some(n => n.task.risk === 'High');

    if (hasCritical) overallRisk = 'Critical';
    else if (hasHigh) overallRisk = 'High';
    else if (totalNodes > 8) overallRisk = 'Medium';

    return {
      totalNodes,
      criticalPathLength,
      maxParallelWidth,
      recommendedStrategy,
      overallRisk
    };
  }
}
export const executionAnalyzer = new ExecutionAnalyzer();

import { TaskGraph } from './taskTypes';

export class TaskEstimator {
  public refineEstimates(graph: TaskGraph): { totalTasks: number; totalTimeMs: number; totalTokens: number; criticalPathLength: number } {
    let totalTimeMs = 0;
    let totalTokens = 0;
    const taskCount = Object.keys(graph.nodes).length;

    for (const taskId of Object.keys(graph.nodes)) {
      const task = graph.nodes[taskId].task;
      // Adjust estimation based on file/symbol count
      const fileFactor = Math.max(1, task.requiredFiles.length);
      const symbolFactor = Math.max(1, task.requiredSymbols.length);

      task.estimatedTimeMs = Math.round(task.estimatedTimeMs * (1 + (fileFactor - 1) * 0.2 + (symbolFactor - 1) * 0.1));
      task.estimatedTokens = Math.round(task.estimatedTokens * (1 + (fileFactor - 1) * 0.3 + (symbolFactor - 1) * 0.15));

      totalTimeMs += task.estimatedTimeMs;
      totalTokens += task.estimatedTokens;
    }

    graph.totalEstimatedTimeMs = totalTimeMs;
    graph.totalEstimatedTokens = totalTokens;

    return {
      totalTasks: taskCount,
      totalTimeMs,
      totalTokens,
      criticalPathLength: graph.criticalPath.length
    };
  }
}
export const taskEstimator = new TaskEstimator();

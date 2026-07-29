import { ResourcePlan } from './executionTypes';
import { TaskGraph } from '../taskGeneration/taskTypes';

export class ResourcePlanner {
  public planResources(
    taskGraph: TaskGraph,
    maxWorkers = 4,
    constraints?: { maxMemoryMB?: number; maxCpuPercent?: number; maxTokensLimit?: number }
  ): ResourcePlan {
    const memoryLimitMB = constraints?.maxMemoryMB || 2048;
    const cpuLimitPercent = constraints?.maxCpuPercent || 80;
    const estimatedTokens = taskGraph.totalEstimatedTokens || 5000;
    const contextWindowTokens = 128000;

    return {
      cpuLimitPercent,
      memoryLimitMB,
      diskLimitMB: 512,
      contextWindowTokens,
      estimatedTokens,
      estimatedRuntimeMs: taskGraph.totalEstimatedTimeMs || 300000,
      maxConcurrentWorkers: maxWorkers
    };
  }
}
export const resourcePlanner = new ResourcePlanner();

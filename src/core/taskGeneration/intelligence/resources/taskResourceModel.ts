import { TaskResourceEstimation } from './resourceTypes';
import { TaskModel } from '../../taskTypes';

export class TaskResourceModel {
  public estimateResources(tasks: TaskModel[]): Record<string, TaskResourceEstimation> {
    const map: Record<string, TaskResourceEstimation> = {};

    for (const task of tasks) {
      map[task.taskId] = {
        taskId: task.taskId,
        cpuPercent: task.taskType === 'Database Task' ? 75 : 40,
        memoryMB: task.taskType === 'UI Task' ? 512 : 256,
        diskMB: 64,
        llmContextTokens: 128000,
        tokenBudget: task.estimatedTokens,
        estimatedRuntimeMs: task.estimatedTimeMs,
        parallelWorkers: task.executionStrategy === 'Parallel' ? 4 : 1
      };
    }

    return map;
  }
}
export const taskResourceModel = new TaskResourceModel();

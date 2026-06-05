import { TaskStrategy } from './baseTaskStrategy';
import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export class BackendTaskStrategy implements TaskStrategy {
  public taskType: TaskType = 'Backend Task';
  public defaultStrategy: ExecutionStrategy = 'Sequential';

  public buildTask(params: {
    taskId: string;
    title: string;
    description: string;
    parentMilestone: string;
    dependencies?: string[];
    requiredFiles?: string[];
    requiredSymbols?: string[];
    expectedOutput?: string;
  }): TaskModel {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || 'Backend service logic and controller flow verified.',
      estimatedTimeMs: 180000,
      estimatedTokens: 1200,
      risk: 'Medium',
      priority: 'High',
      confidence: 0.88,
      executionStrategy: this.defaultStrategy
    };
  }
}
export const backendTaskStrategy = new BackendTaskStrategy();

import { TaskStrategy } from './baseTaskStrategy';
import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export class APITaskStrategy implements TaskStrategy {
  public taskType: TaskType = 'API Task';
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
      expectedOutput: params.expectedOutput || 'API endpoint contract and data routing schema validated.',
      estimatedTimeMs: 150000,
      estimatedTokens: 1000,
      risk: 'Medium',
      priority: 'High',
      confidence: 0.92,
      executionStrategy: this.defaultStrategy
    };
  }
}
export const apiTaskStrategy = new APITaskStrategy();

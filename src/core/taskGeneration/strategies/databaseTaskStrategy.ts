import { TaskStrategy } from './baseTaskStrategy';
import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export class DatabaseTaskStrategy implements TaskStrategy {
  public taskType: TaskType = 'Database Task';
  public defaultStrategy: ExecutionStrategy = 'Manual Approval';

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
      expectedOutput: params.expectedOutput || 'Database schema model/migration script verified.',
      estimatedTimeMs: 240000,
      estimatedTokens: 1500,
      risk: 'High',
      priority: 'Critical',
      confidence: 0.85,
      executionStrategy: this.defaultStrategy
    };
  }
}
export const databaseTaskStrategy = new DatabaseTaskStrategy();

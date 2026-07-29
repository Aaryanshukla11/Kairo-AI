import { TaskStrategy } from './baseTaskStrategy';
import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export class TestingTaskStrategy implements TaskStrategy {
  public taskType: TaskType = 'Testing Task';
  public defaultStrategy: ExecutionStrategy = 'Parallel';

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
      expectedOutput: params.expectedOutput || 'Unit and integration test suites passing.',
      estimatedTimeMs: 90000,
      estimatedTokens: 600,
      risk: 'Low',
      priority: 'Normal',
      confidence: 0.95,
      executionStrategy: this.defaultStrategy
    };
  }
}
export const testingTaskStrategy = new TestingTaskStrategy();

import { TaskStrategy } from './baseTaskStrategy';
import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export class UITaskStrategy implements TaskStrategy {
  public taskType: TaskType = 'UI Task';
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
      expectedOutput: params.expectedOutput || 'UI component layout and state rendering implemented.',
      estimatedTimeMs: 120000, // 2 mins estimate
      estimatedTokens: 800,
      risk: 'Low',
      priority: 'Normal',
      confidence: 0.9,
      executionStrategy: this.defaultStrategy
    };
  }
}
export const uiTaskStrategy = new UITaskStrategy();

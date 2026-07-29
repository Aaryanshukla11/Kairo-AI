import { TaskModel, TaskType, ExecutionStrategy } from '../taskTypes';

export interface TaskStrategy {
  taskType: TaskType;
  defaultStrategy: ExecutionStrategy;
  buildTask(params: {
    taskId: string;
    title: string;
    description: string;
    parentMilestone: string;
    dependencies?: string[];
    requiredFiles?: string[];
    requiredSymbols?: string[];
    expectedOutput?: string;
  }): TaskModel;
}

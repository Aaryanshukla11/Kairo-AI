import { ReplanStrategyType } from '../replanningTypes';

export class MilestoneReplanStrategy {
  replan(preservedTasks: string[], affectedTasks: string[]): { newExecutionOrder: string[]; strategy: ReplanStrategyType } {
    return {
      newExecutionOrder: [...preservedTasks, ...affectedTasks],
      strategy: ReplanStrategyType.Milestone
    };
  }
}

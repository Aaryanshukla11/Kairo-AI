import { ReplanStrategyType } from '../replanningTypes';

export class DependencyReplanStrategy {
  replan(preservedTasks: string[], affectedTasks: string[]): { newExecutionOrder: string[]; strategy: ReplanStrategyType } {
    return {
      newExecutionOrder: [...preservedTasks, ...affectedTasks],
      strategy: ReplanStrategyType.Dependency
    };
  }
}

import { ReplanStrategyType } from '../replanningTypes';

export class PartialReplanStrategy {
  replan(preservedTasks: string[], affectedTasks: string[]): { newExecutionOrder: string[]; strategy: ReplanStrategyType } {
    const updatedAffected = affectedTasks.map(id => `${id}-replanned`);
    return {
      newExecutionOrder: [...preservedTasks, ...updatedAffected],
      strategy: ReplanStrategyType.Partial
    };
  }
}

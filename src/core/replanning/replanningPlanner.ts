import { ReplanStrategyType } from './replanningTypes';
import { PartialReplanStrategy, MilestoneReplanStrategy, TaskReplanStrategy, DependencyReplanStrategy, RecoveryReplanStrategy } from './strategies';

export class ReplanningPlanner {
  private partial = new PartialReplanStrategy();
  private milestone = new MilestoneReplanStrategy();
  private task = new TaskReplanStrategy();
  private dependency = new DependencyReplanStrategy();
  private recovery = new RecoveryReplanStrategy();

  generateUpdatedPlan(preservedTasks: string[], affectedTasks: string[], strategyType: ReplanStrategyType = ReplanStrategyType.Partial): { newExecutionOrder: string[]; strategy: ReplanStrategyType } {
    switch (strategyType) {
      case ReplanStrategyType.Milestone:
        return this.milestone.replan(preservedTasks, affectedTasks);
      case ReplanStrategyType.Incremental:
        return this.task.replan(preservedTasks, affectedTasks);
      case ReplanStrategyType.Dependency:
        return this.dependency.replan(preservedTasks, affectedTasks);
      case ReplanStrategyType.Recovery:
        return this.recovery.replan(preservedTasks, affectedTasks);
      case ReplanStrategyType.Partial:
      default:
        return this.partial.replan(preservedTasks, affectedTasks);
    }
  }
}

export const replanningPlanner = new ReplanningPlanner();

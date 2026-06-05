import { MilestoneNode, MilestoneWorkflow, MilestoneStrategyType } from './milestoneTypes';
import { SequentialMilestoneStrategy, ParallelMilestoneStrategy, HybridMilestoneStrategy, IsolatedMilestoneStrategy } from './strategies';

export class MilestoneCoordinator {
  private sequential = new SequentialMilestoneStrategy();
  private parallel = new ParallelMilestoneStrategy();
  private hybrid = new HybridMilestoneStrategy();
  private isolated = new IsolatedMilestoneStrategy();

  coordinate(milestones: MilestoneNode[], executionOrder: string[], strategyType: MilestoneStrategyType = MilestoneStrategyType.Hybrid): MilestoneWorkflow {
    switch (strategyType) {
      case MilestoneStrategyType.Sequential:
        return this.sequential.apply(milestones, executionOrder);
      case MilestoneStrategyType.Parallel:
        return this.parallel.apply(milestones, executionOrder);
      case MilestoneStrategyType.Isolated:
        return this.isolated.apply(milestones, executionOrder);
      case MilestoneStrategyType.Hybrid:
      default:
        return this.hybrid.apply(milestones, executionOrder);
    }
  }
}

export const milestoneCoordinator = new MilestoneCoordinator();

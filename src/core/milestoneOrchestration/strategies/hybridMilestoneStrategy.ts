import { MilestoneWorkflow, MilestoneNode, MilestoneStrategyType } from '../milestoneTypes';
import { milestoneScheduler } from '../milestoneScheduler';

export class HybridMilestoneStrategy {
  apply(milestones: MilestoneNode[], executionOrder: string[]): MilestoneWorkflow {
    const parallelGroups = milestoneScheduler.scheduleParallelGroups(milestones, executionOrder);
    const criticalPath = milestoneScheduler.calculateCriticalPath(milestones);

    return {
      id: `wf-hyb-${Date.now()}`,
      title: 'Hybrid Milestone Execution Strategy',
      strategy: MilestoneStrategyType.Hybrid,
      milestones,
      executionOrder,
      parallelMilestones: parallelGroups,
      criticalPath,
      totalEstimatedRuntime: milestones.reduce((sum, m) => sum + m.estimatedRuntime, 0) * 0.8,
      totalEstimatedTokens: milestones.reduce((sum, m) => sum + m.estimatedTokens, 0)
    };
  }
}

import { MilestoneWorkflow, MilestoneNode, MilestoneStrategyType } from '../milestoneTypes';

export class SequentialMilestoneStrategy {
  apply(milestones: MilestoneNode[], executionOrder: string[]): MilestoneWorkflow {
    return {
      id: `wf-seq-${Date.now()}`,
      title: 'Sequential Milestone Execution Strategy',
      strategy: MilestoneStrategyType.Sequential,
      milestones,
      executionOrder,
      parallelMilestones: executionOrder.map(id => [id]),
      criticalPath: executionOrder,
      totalEstimatedRuntime: milestones.reduce((sum, m) => sum + m.estimatedRuntime, 0),
      totalEstimatedTokens: milestones.reduce((sum, m) => sum + m.estimatedTokens, 0)
    };
  }
}

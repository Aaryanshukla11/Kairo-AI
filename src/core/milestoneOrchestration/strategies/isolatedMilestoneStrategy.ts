import { MilestoneWorkflow, MilestoneNode, MilestoneStrategyType } from '../milestoneTypes';

export class IsolatedMilestoneStrategy {
  apply(milestones: MilestoneNode[], executionOrder: string[]): MilestoneWorkflow {
    return {
      id: `wf-iso-${Date.now()}`,
      title: 'Isolated Milestone Execution Strategy',
      strategy: MilestoneStrategyType.Isolated,
      milestones,
      executionOrder,
      parallelMilestones: executionOrder.map(id => [id]),
      criticalPath: executionOrder,
      totalEstimatedRuntime: milestones.reduce((sum, m) => sum + m.estimatedRuntime, 0) * 1.1,
      totalEstimatedTokens: milestones.reduce((sum, m) => sum + m.estimatedTokens, 0)
    };
  }
}

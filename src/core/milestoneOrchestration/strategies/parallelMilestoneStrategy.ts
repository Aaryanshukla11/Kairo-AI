import { MilestoneWorkflow, MilestoneNode, MilestoneStrategyType } from '../milestoneTypes';
import { milestoneScheduler } from '../milestoneScheduler';

export class ParallelMilestoneStrategy {
  apply(milestones: MilestoneNode[], executionOrder: string[]): MilestoneWorkflow {
    const parallelGroups = milestoneScheduler.scheduleParallelGroups(milestones, executionOrder);
    const criticalPath = milestoneScheduler.calculateCriticalPath(milestones);

    const totalRuntime = parallelGroups.reduce((acc, group) => {
      const groupRuntime = Math.max(...group.map(id => milestones.find(m => m.id === id)?.estimatedRuntime || 0));
      return acc + groupRuntime;
    }, 0);

    return {
      id: `wf-par-${Date.now()}`,
      title: 'Parallel Milestone Execution Strategy',
      strategy: MilestoneStrategyType.Parallel,
      milestones,
      executionOrder,
      parallelMilestones: parallelGroups,
      criticalPath,
      totalEstimatedRuntime: totalRuntime,
      totalEstimatedTokens: milestones.reduce((sum, m) => sum + m.estimatedTokens, 0)
    };
  }
}

import { MilestoneNode, MilestoneState } from './milestoneTypes';

export interface MilestoneProgressReport {
  totalCount: number;
  completedCount: number;
  runningCount: number;
  failedCount: number;
  progressPercentage: number;
  activeMilestones: string[];
}

export class MilestoneProgressTracker {
  calculateProgress(milestones: MilestoneNode[]): MilestoneProgressReport {
    const totalCount = milestones.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        completedCount: 0,
        runningCount: 0,
        failedCount: 0,
        progressPercentage: 100,
        activeMilestones: []
      };
    }

    const completedCount = milestones.filter(m => m.status === MilestoneState.Completed).length;
    const runningCount = milestones.filter(m => m.status === MilestoneState.Running).length;
    const failedCount = milestones.filter(m => m.status === MilestoneState.Failed).length;
    const activeMilestones = milestones.filter(m => m.status === MilestoneState.Running).map(m => m.id);

    const progressPercentage = Number(((completedCount / totalCount) * 100).toFixed(1));

    return {
      totalCount,
      completedCount,
      runningCount,
      failedCount,
      progressPercentage,
      activeMilestones
    };
  }
}

export const milestoneProgressTracker = new MilestoneProgressTracker();

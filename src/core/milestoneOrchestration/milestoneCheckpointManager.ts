import { MilestoneNode, MilestoneCheckpoint } from './milestoneTypes';

export class MilestoneCheckpointManager {
  generateCheckpoints(milestones: MilestoneNode[]): MilestoneCheckpoint[] {
    const checkpoints: MilestoneCheckpoint[] = [];

    milestones.forEach((m, idx) => {
      checkpoints.push({
        checkpointId: `CP-${m.id}-VERIFIED`,
        milestoneId: m.id,
        completedTasks: m.tasks,
        workspaceSnapshot: `snapshot-${m.id.toLowerCase()}-v1.0`,
        recoveryPoint: m.rollbackBoundary || `RB-${m.id}`,
        verificationStatus: 'Verified',
        timestamp: Date.now() + (idx * 5000)
      });
    });

    return checkpoints;
  }
}

export const milestoneCheckpointManager = new MilestoneCheckpointManager();

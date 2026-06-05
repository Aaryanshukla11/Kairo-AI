import { CheckpointModel, ExecutionStep } from './executionTypes';
import { TaskGraph } from '../taskGeneration/taskTypes';

export class CheckpointPlanner {
  public planCheckpoints(taskGraph: TaskGraph, steps: ExecutionStep[]): CheckpointModel[] {
    const checkpoints: CheckpointModel[] = [];
    const milestoneMap = new Map<string, string[]>(); // milestoneId -> stepIds

    for (const step of steps) {
      const node = taskGraph.nodes[step.taskId];
      if (node) {
        const msId = node.task.parentMilestone;
        if (!milestoneMap.has(msId)) milestoneMap.set(msId, []);
        milestoneMap.get(msId)!.push(step.stepId);
      }
    }

    let cpIdx = 1;
    const completedSoFar: string[] = [];

    for (const [msId, stepIds] of milestoneMap.entries()) {
      const checkpointId = `CKP-${cpIdx++}`;
      const rollbackBoundary = `RBB-${msId}`;

      checkpoints.push({
        checkpointId,
        parentTasks: stepIds,
        completedTasks: [...completedSoFar],
        workspaceSnapshot: `snap-cp-${msId.toLowerCase()}-${Date.now()}`,
        rollbackBoundary,
        verificationRules: [
          'Verify TypeScript build compilation succeeds without syntax errors.',
          'Verify core module imports and workspace boundary constraints pass.'
        ],
        timestamp: Date.now()
      });

      completedSoFar.push(...stepIds);
    }

    return checkpoints;
  }
}
export const checkpointPlanner = new CheckpointPlanner();

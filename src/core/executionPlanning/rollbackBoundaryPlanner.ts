import { RollbackBoundary, CheckpointModel, ExecutionStep } from './executionTypes';
import { TaskGraph } from '../taskGeneration/taskTypes';

export class RollbackBoundaryPlanner {
  public planRollbackBoundaries(checkpoints: CheckpointModel[], taskGraph: TaskGraph, steps: ExecutionStep[]): RollbackBoundary[] {
    const boundaries: RollbackBoundary[] = [];

    for (const cp of checkpoints) {
      const affectedTaskIds = [...cp.parentTasks];
      const affectedFilesSet = new Set<string>();

      for (const stepId of affectedTaskIds) {
        const step = steps.find(s => s.stepId === stepId);
        if (step && taskGraph.nodes[step.taskId]) {
          const task = taskGraph.nodes[step.taskId].task;
          for (const file of task.requiredFiles) {
            affectedFilesSet.add(file);
          }
        }
      }

      boundaries.push({
        boundaryId: cp.rollbackBoundary,
        checkpointId: cp.checkpointId,
        affectedTaskIds,
        affectedFiles: Array.from(affectedFilesSet),
        estimatedRollbackTimeMs: affectedTaskIds.length * 120 + 200,
        isIsolated: true
      });
    }

    return boundaries;
  }
}
export const rollbackBoundaryPlanner = new RollbackBoundaryPlanner();

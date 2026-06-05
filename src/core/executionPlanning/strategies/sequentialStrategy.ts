import { ExecutionStrategy } from './baseExecutionStrategy';
import { ExecutionStep, ExecutionStrategyType } from '../executionTypes';
import { TaskGraph } from '../../taskGeneration/taskTypes';

export class SequentialStrategy implements ExecutionStrategy {
  public strategyType: ExecutionStrategyType = 'Sequential';

  public scheduleSteps(taskGraph: TaskGraph, maxWorkers: number): { steps: ExecutionStep[]; parallelGroups: string[][] } {
    const steps: ExecutionStep[] = [];
    const parallelGroups: string[][] = [];

    let currentTime = 0;
    const taskIds = Object.keys(taskGraph.nodes);

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const taskNode = taskGraph.nodes[taskId];
      const stepId = `STEP-${i + 1}`;

      const step: ExecutionStep = {
        stepId,
        taskId: taskNode.task.taskId,
        taskTitle: taskNode.task.title,
        strategy: 'Sequential',
        workerIndex: 0, // Single worker
        estimatedStartTimeMs: currentTime,
        estimatedDurationMs: taskNode.task.estimatedTimeMs,
        dependencies: i > 0 ? [`STEP-${i}`] : []
      };

      steps.push(step);
      parallelGroups.push([stepId]); // Each group contains 1 step sequentially
      currentTime += taskNode.task.estimatedTimeMs;
    }

    return { steps, parallelGroups };
  }
}
export const sequentialStrategy = new SequentialStrategy();

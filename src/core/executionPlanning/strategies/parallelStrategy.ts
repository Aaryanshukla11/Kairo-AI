import { ExecutionStrategy } from './baseExecutionStrategy';
import { ExecutionStep, ExecutionStrategyType } from '../executionTypes';
import { TaskGraph } from '../../taskGeneration/taskTypes';

export class ParallelStrategy implements ExecutionStrategy {
  public strategyType: ExecutionStrategyType = 'Parallel';

  public scheduleSteps(taskGraph: TaskGraph, maxWorkers: number): { steps: ExecutionStep[]; parallelGroups: string[][] } {
    const steps: ExecutionStep[] = [];
    const parallelGroups: string[][] = [];
    const taskIdToStepId = new Map<string, string>();

    // Group tasks by depth level
    const depthMap = new Map<number, string[]>();
    for (const taskId of Object.keys(taskGraph.nodes)) {
      const depth = taskGraph.nodes[taskId].depth;
      if (!depthMap.has(depth)) depthMap.set(depth, []);
      depthMap.get(depth)!.push(taskId);
    }

    const maxDepth = Math.max(...Array.from(depthMap.keys()), 0);
    let currentTime = 0;
    let stepCounter = 1;

    for (let d = 0; d <= maxDepth; d++) {
      const levelTaskIds = depthMap.get(d) || [];
      const currentLevelStepIds: string[] = [];
      let maxLevelDuration = 0;

      for (let w = 0; w < levelTaskIds.length; w++) {
        const taskId = levelTaskIds[w];
        const taskNode = taskGraph.nodes[taskId];
        const stepId = `STEP-${stepCounter++}`;
        taskIdToStepId.set(taskId, stepId);

        const depStepIds = taskNode.parents
          .map(pId => taskIdToStepId.get(pId))
          .filter((id): id is string => Boolean(id));

        const workerIndex = w % maxWorkers;

        const step: ExecutionStep = {
          stepId,
          taskId: taskNode.task.taskId,
          taskTitle: taskNode.task.title,
          strategy: 'Parallel',
          workerIndex,
          estimatedStartTimeMs: currentTime,
          estimatedDurationMs: taskNode.task.estimatedTimeMs,
          dependencies: depStepIds
        };

        steps.push(step);
        currentLevelStepIds.push(stepId);
        maxLevelDuration = Math.max(maxLevelDuration, taskNode.task.estimatedTimeMs);
      }

      if (currentLevelStepIds.length > 0) {
        parallelGroups.push(currentLevelStepIds);
        currentTime += maxLevelDuration;
      }
    }

    return { steps, parallelGroups };
  }
}
export const parallelStrategy = new ParallelStrategy();

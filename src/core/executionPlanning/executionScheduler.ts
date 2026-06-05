import { ExecutionSchedule, ExecutionStrategyType, CheckpointModel } from './executionTypes';
import { TaskGraph } from '../taskGeneration/taskTypes';
import { sequentialStrategy, parallelStrategy, hybridStrategy, isolatedStrategy } from './strategies';

export class ExecutionScheduler {
  public schedule(taskGraph: TaskGraph, strategyType: ExecutionStrategyType, maxWorkers = 4): ExecutionSchedule {
    let result: { steps: any[]; parallelGroups: string[][] };

    switch (strategyType) {
      case 'Sequential':
        result = sequentialStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case 'Parallel':
        result = parallelStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case 'Isolated':
        result = isolatedStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case 'Hybrid':
      default:
        result = hybridStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
    }

    const totalTimeSlots = result.parallelGroups.length;
    let estimatedTotalRuntimeMs = 0;

    for (const group of result.parallelGroups) {
      let groupMaxDuration = 0;
      for (const stepId of group) {
        const step = result.steps.find(s => s.stepId === stepId);
        if (step) {
          groupMaxDuration = Math.max(groupMaxDuration, step.estimatedDurationMs);
        }
      }
      estimatedTotalRuntimeMs += groupMaxDuration;
    }

    return {
      steps: result.steps,
      parallelGroups: result.parallelGroups,
      totalTimeSlots,
      estimatedTotalRuntimeMs
    };
  }

  public attachCheckpointsToSchedule(schedule: ExecutionSchedule, checkpoints: CheckpointModel[]): void {
    const checkpointMap = new Map<string, string>(); // stepId -> checkpointId
    for (const cp of checkpoints) {
      for (const stepId of cp.parentTasks) {
        checkpointMap.set(stepId, cp.checkpointId);
      }
    }

    for (const step of schedule.steps) {
      if (checkpointMap.has(step.stepId)) {
        step.checkpointId = checkpointMap.get(step.stepId);
      }
    }
  }
}
export const executionScheduler = new ExecutionScheduler();

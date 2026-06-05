import { ExecutionSchedule } from './executionTypes';

export class ExecutionOptimizer {
  public optimizeSchedule(schedule: ExecutionSchedule, maxWorkers: number): void {
    // Rebalance worker indexes across parallel steps
    for (const group of schedule.parallelGroups) {
      for (let i = 0; i < group.length; i++) {
        const stepId = group[i];
        const step = schedule.steps.find(s => s.stepId === stepId);
        if (step) {
          step.workerIndex = i % maxWorkers;
        }
      }
    }
  }
}
export const executionOptimizer = new ExecutionOptimizer();

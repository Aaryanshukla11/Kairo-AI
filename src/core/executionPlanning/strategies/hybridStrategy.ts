import { ExecutionStrategy } from './baseExecutionStrategy';
import { ExecutionStep, ExecutionStrategyType } from '../executionTypes';
import { TaskGraph } from '../../taskGeneration/taskTypes';
import { parallelStrategy } from './parallelStrategy';

export class HybridStrategy implements ExecutionStrategy {
  public strategyType: ExecutionStrategyType = 'Hybrid';

  public scheduleSteps(taskGraph: TaskGraph, maxWorkers: number): { steps: ExecutionStep[]; parallelGroups: string[][] } {
    // Hybrid uses parallel scheduling for independent tasks and marks critical path tasks as Hybrid
    const res = parallelStrategy.scheduleSteps(taskGraph, Math.max(2, maxWorkers));
    for (const step of res.steps) {
      step.strategy = 'Hybrid';
    }
    return res;
  }
}
export const hybridStrategy = new HybridStrategy();

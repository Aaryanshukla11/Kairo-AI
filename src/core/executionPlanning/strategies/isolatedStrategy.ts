import { ExecutionStrategy } from './baseExecutionStrategy';
import { ExecutionStep, ExecutionStrategyType } from '../executionTypes';
import { TaskGraph } from '../../taskGeneration/taskTypes';
import { sequentialStrategy } from './sequentialStrategy';

export class IsolatedStrategy implements ExecutionStrategy {
  public strategyType: ExecutionStrategyType = 'Isolated';

  public scheduleSteps(taskGraph: TaskGraph, maxWorkers: number): { steps: ExecutionStep[]; parallelGroups: string[][] } {
    // Isolated strategy runs tasks sequentially in isolated sandboxes
    const res = sequentialStrategy.scheduleSteps(taskGraph, 1);
    for (const step of res.steps) {
      step.strategy = 'Isolated';
    }
    return res;
  }
}
export const isolatedStrategy = new IsolatedStrategy();

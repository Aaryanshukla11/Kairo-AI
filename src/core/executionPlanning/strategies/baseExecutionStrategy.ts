import { ExecutionStep, ExecutionStrategyType } from '../executionTypes';
import { TaskGraph } from '../../taskGeneration/taskTypes';

export interface ExecutionStrategy {
  strategyType: ExecutionStrategyType;
  scheduleSteps(taskGraph: TaskGraph, maxWorkers: number): { steps: ExecutionStep[]; parallelGroups: string[][] };
}

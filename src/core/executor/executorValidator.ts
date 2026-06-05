import { ExecutionGraph } from '../executionGraph/graphTypes';
import { ExecutorState } from './executorTypes';

export class ExecutorValidator {
  /**
   * Validates the execution graph for run eligibility.
   */
  public validateGraphForExecution(graph: ExecutionGraph): void {
    if (!graph) {
      throw new Error('Executor validation failed: Null or undefined graph');
    }
    if (!graph.nodes || graph.nodes.length === 0) {
      throw new Error('Executor validation failed: Empty graph');
    }
  }

  /**
   * Validates that the executor state allows starting a new run.
   */
  public validateStateForStart(currentState: ExecutorState): void {
    if (
      currentState === ExecutorState.Running ||
      currentState === ExecutorState.Preparing ||
      currentState === ExecutorState.Queued
    ) {
      throw new Error('Executor validation failed: Executor is already running');
    }
  }
}

export const executorValidator = new ExecutorValidator();

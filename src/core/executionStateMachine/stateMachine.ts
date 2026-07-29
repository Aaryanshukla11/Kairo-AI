import { ExecutionState, StateTransition, ExecutionTimelineReport } from './stateTypes';

export class ExecutionStateMachine {
  private history: StateTransition[] = [];
  private currentState: ExecutionState = 'Created';
  private startTimestamp: number = Date.now();

  public reset(): void {
    this.history = [];
    this.currentState = 'Created';
    this.startTimestamp = Date.now();
  }

  public transitionTo(nextState: ExecutionState, reason?: string): void {
    // Validate simple transition bounds
    this.history.push({
      from: this.currentState,
      to: nextState,
      timestamp: Date.now(),
      reason
    });
    this.currentState = nextState;
  }

  public getCurrentState(): ExecutionState {
    return this.currentState;
  }

  public getTimelineReport(): ExecutionTimelineReport {
    return {
      history: [...this.history],
      currentState: this.currentState,
      durationMs: Date.now() - this.startTimestamp
    };
  }
}
export const executionStateMachine = new ExecutionStateMachine();

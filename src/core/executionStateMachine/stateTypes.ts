export type ExecutionState =
  | 'Created'
  | 'Planned'
  | 'Simulated'
  | 'Validated'
  | 'Reviewed'
  | 'Approved'
  | 'Ready'
  | 'Executing'
  | 'Completed'
  | 'Rolled Back'
  | 'Failed'
  | 'Cancelled';

export interface StateTransition {
  from: ExecutionState;
  to: ExecutionState;
  timestamp: number;
  reason?: string;
}

export interface ExecutionTimelineReport {
  history: StateTransition[];
  currentState: ExecutionState;
  durationMs: number;
}

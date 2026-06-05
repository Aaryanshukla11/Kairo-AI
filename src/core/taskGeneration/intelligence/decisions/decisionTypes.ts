export type TaskDecisionAction =
  | 'Skip'
  | 'Merge'
  | 'Split'
  | 'Parallelize'
  | 'Delay'
  | 'Cancel'
  | 'Escalate';

export interface TaskDecision {
  taskId: string;
  action: TaskDecisionAction;
  reason: string;
  confidence: number;
}

export enum ExecutorState {
  Idle = 'Idle',
  Preparing = 'Preparing',
  Queued = 'Queued',
  Running = 'Running',
  Paused = 'Paused',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

export interface ExecutorProgress {
  status: ExecutorState;
  currentStepId: string | null;
  currentStepTitle: string | null;
  completedSteps: number;
  remainingSteps: number;
  totalSteps: number;
  progressPercent: number;
}

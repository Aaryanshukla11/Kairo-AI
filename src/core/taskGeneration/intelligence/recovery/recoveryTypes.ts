export interface TaskRecoveryPlan {
  taskId: string;
  retryStrategy: 'Exponential Backoff' | 'Immediate Retry' | 'No Retry';
  rollbackStrategy: 'Snapshot Revert' | 'Git Stash Pop' | 'Manual Repair';
  failureRecovery: string;
  compensationSteps: string[];
  recoveryConfidence: number; // 0.0 - 1.0
}

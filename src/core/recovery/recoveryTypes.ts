export enum FailureType {
  ExecutionFailure = 'ExecutionFailure',
  ValidationFailure = 'ValidationFailure',
  PolicyFailure = 'PolicyFailure',
  DependencyFailure = 'DependencyFailure',
  WorkspaceFailure = 'WorkspaceFailure',
  ResourceFailure = 'ResourceFailure',
  Timeout = 'Timeout',
  UnexpectedException = 'UnexpectedException',
  UserCancellation = 'UserCancellation'
}

export enum RecoveryStrategyType {
  Retry = 'Retry',
  Rollback = 'Rollback',
  CheckpointRestore = 'CheckpointRestore',
  PartialResume = 'PartialResume',
  WorkflowReconstruction = 'WorkflowReconstruction',
  ManualIntervention = 'ManualIntervention'
}

export enum RecoveryState {
  Idle = 'Idle',
  FailureDetected = 'FailureDetected',
  RecoveryPlanning = 'RecoveryPlanning',
  Restoring = 'Restoring',
  Validating = 'Validating',
  Resuming = 'Resuming',
  Recovered = 'Recovered',
  ManualIntervention = 'ManualIntervention',
  FailedRecovery = 'FailedRecovery'
}

export interface CheckpointModel {
  checkpointId: string;
  workflowVersion: string;
  workspaceSnapshot: string;
  transactionId: string;
  executionState: string;
  recoveryMetadata: Record<string, any>;
  validationStatus: 'Verified' | 'Pending' | 'Failed';
}

export interface RecoveryPlanModel {
  planId: string;
  strategy: RecoveryStrategyType;
  targetCheckpoint?: CheckpointModel;
  steps: string[];
  estimatedTimeMs: number;
}

export interface RecoveryReport {
  reportId: string;
  timestamp: number;
  workflowId: string;
  failureType: FailureType;
  failureMessage: string;
  strategy: RecoveryStrategyType;
  checkpointUsed?: CheckpointModel;
  recoveredTasks: string[];
  rollbackStatus: 'Success' | 'NotRequired' | 'Failed';
  recoveryState: RecoveryState;
  confidence: number;
  validationResult: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface RecoveryInput {
  workflowId?: string;
  failureType?: FailureType;
  failureMessage?: string;
  failedStageId?: string;
  preferredStrategy?: RecoveryStrategyType;
  context?: Record<string, any>;
}

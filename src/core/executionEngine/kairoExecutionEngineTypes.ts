export type ExecutionPipelineStage =
  | 'RECEIVE_GENERATION_RESULT'
  | 'VALIDATE_GENERATION_RESULT'
  | 'CREATE_EXECUTION_QUEUE'
  | 'FILE_WRITE'
  | 'PACKAGE_INSTALLATION'
  | 'BUILD'
  | 'TESTS'
  | 'VERIFICATION'
  | 'GENERATE_EXECUTION_REPORT';

export interface IKairoExecutionLog {
  readonly stage: ExecutionPipelineStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IExecutionReport {
  readonly requestId: string;
  readonly sessionId: string;
  readonly workspaceRoot?: string;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly writtenFiles: readonly string[];
  readonly updatedFiles: readonly string[];
  readonly skippedFiles: readonly string[];
  readonly packagesInstalled: readonly string[];
  readonly buildStatus: 'PASSED' | 'FAILED';
  readonly testsStatus: 'PASSED' | 'FAILED';
  readonly totalExecutionTimeMs: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface IEventReport {
  readonly totalEventsPublished: number;
  readonly totalEventsProcessed: number;
  readonly eventTypesSeen: readonly string[];
  readonly activeSubscribersCount: number;
}

export interface IFailureReport {
  readonly failedStage?: ExecutionPipelineStage;
  readonly errorMessage: string;
  readonly timestamp: number;
}

export interface IRetryReport {
  readonly totalRetries: number;
  readonly successfulRetries: number;
  readonly retryLogs: readonly string[];
}

export interface IRollbackReport {
  readonly rollbackTriggered: boolean;
  readonly checkpointId?: string;
  readonly restoredFiles: readonly string[];
  readonly status: 'ROLLED_BACK' | 'NOT_NEEDED' | 'FAILED';
}

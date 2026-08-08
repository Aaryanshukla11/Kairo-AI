export interface IBackupRecord {
  readonly filePath: string;
  readonly originalContent: string | null; // null if file did not exist
}

export interface IWorkspaceOperationLog {
  readonly operationId: string;
  readonly path: string;
  readonly status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
  readonly durationMs: number;
  readonly error?: string;
}

export interface IWorkspaceExecutionReport {
  readonly completedOperations: readonly string[];
  readonly failedOperations: readonly string[];
  readonly skippedOperations: readonly string[];
  readonly rollbackStatus: 'NONE' | 'SUCCESSFUL' | 'FAILED';
  readonly logs: readonly IWorkspaceOperationLog[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

import { IWorkspaceExecutionReport } from '../../workspace-engine/types';

export interface IIntegratedWorkspaceReport {
  readonly executionId: string;
  readonly createdFiles: readonly string[];
  readonly modifiedFiles: readonly string[];
  readonly deletedFiles: readonly string[];
  readonly createdDirectories: readonly string[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly rollbackStatus: 'NONE' | 'SUCCESSFUL' | 'FAILED';
  readonly executionDurationMs: number;
  readonly detailedReports: readonly IWorkspaceExecutionReport[];
}

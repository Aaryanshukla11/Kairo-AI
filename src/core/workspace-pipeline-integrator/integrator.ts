import { IGenerationContract } from '../generation-contract/types';
import { IFilesystemAdapter } from '../workspace-engine/fs-adapter';
import { workspaceEngine } from '../workspace-engine';
import { IIntegratedWorkspaceReport } from './types';
import { IWorkspaceExecutionReport } from '../workspace-engine/types';
import * as crypto from 'crypto';

export class WorkspacePipelineIntegrator {
  public async integrateAndApply(
    contracts: readonly IGenerationContract[],
    fs: IFilesystemAdapter
  ): Promise<IIntegratedWorkspaceReport> {
    const startTime = Date.now();
    const executionId = crypto.randomUUID ? crypto.randomUUID() : `wk-run-${Date.now()}`;
    
    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];
    const deletedFiles: string[] = [];
    const createdDirectories: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const detailedReports: IWorkspaceExecutionReport[] = [];
    
    let rollbackStatus: 'NONE' | 'SUCCESSFUL' | 'FAILED' = 'NONE';
    let failed = false;

    for (const contract of contracts) {
      if (failed) break;

      const report = await workspaceEngine.applyChanges(contract, fs);
      detailedReports.push(report);

      warnings.push(...report.warnings);

      if (report.rollbackStatus !== 'NONE' && report.rollbackStatus !== 'SUCCESSFUL') {
        failed = true;
        rollbackStatus = 'FAILED';
        errors.push(...report.errors);
        break;
      }

      if (report.errors.length > 0) {
        failed = true;
        rollbackStatus = 'SUCCESSFUL'; // workspaceEngine rolled back internally
        errors.push(...report.errors);
        break;
      }

      // Collect completed items
      for (const op of contract.fileOperations) {
        if (op.operationType === 'CREATE_FILE') {
          createdFiles.push(op.filePath);
        } else if (op.operationType === 'MODIFY_FILE') {
          modifiedFiles.push(op.filePath);
        } else if (op.operationType === 'DELETE_FILE') {
          deletedFiles.push(op.filePath);
        }
      }

      for (const op of contract.directoryOperations) {
        if (op.operationType === 'CREATE_DIRECTORY') {
          createdDirectories.push(op.directoryPath);
        }
      }
    }

    const duration = Date.now() - startTime;

    return {
      executionId,
      createdFiles: Object.freeze(createdFiles),
      modifiedFiles: Object.freeze(modifiedFiles),
      deletedFiles: Object.freeze(deletedFiles),
      createdDirectories: Object.freeze(createdDirectories),
      warnings: Object.freeze(warnings),
      errors: Object.freeze(errors),
      rollbackStatus,
      executionDurationMs: duration,
      detailedReports: Object.freeze(detailedReports)
    };
  }
}

export const workspacePipelineIntegrator = new WorkspacePipelineIntegrator();
export default workspacePipelineIntegrator;

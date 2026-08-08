import { IGenerationContract } from '../generation-contract/types';
import { IWorkspaceExecutionReport, IWorkspaceOperationLog } from './types';
import { IFilesystemAdapter } from './fs-adapter';
import { BackupManager } from './backup';

export class OperationExecutor {
  public async executeContract(
    contract: IGenerationContract,
    fs: IFilesystemAdapter
  ): Promise<IWorkspaceExecutionReport> {
    const backupManager = new BackupManager();
    const completedOperations: string[] = [];
    const failedOperations: string[] = [];
    const skippedOperations: string[] = [];
    const logs: IWorkspaceOperationLog[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let rollbackStatus: 'NONE' | 'SUCCESSFUL' | 'FAILED' = 'NONE';
    let failed = false;

    // 1. Process Directory Operations
    for (const dirOp of contract.directoryOperations) {
      const opStartTime = Date.now();
      try {
        if (dirOp.operationType === 'CREATE_DIRECTORY') {
          await fs.createDir(dirOp.directoryPath);
        } else if (dirOp.operationType === 'DELETE_DIRECTORY') {
          await fs.deleteDir(dirOp.directoryPath);
        }
        completedOperations.push(dirOp.directoryPath);
        logs.push({
          operationId: `dir-${dirOp.directoryPath}`,
          path: dirOp.directoryPath,
          status: 'COMPLETED',
          durationMs: Date.now() - opStartTime
        });
      } catch (err: any) {
        failed = true;
        failedOperations.push(dirOp.directoryPath);
        errors.push(`Directory operation failed on '${dirOp.directoryPath}': ${err.message}`);
        logs.push({
          operationId: `dir-${dirOp.directoryPath}`,
          path: dirOp.directoryPath,
          status: 'FAILED',
          durationMs: Date.now() - opStartTime,
          error: err.message
        });
        break;
      }
    }

    // 2. Process File Operations (if no directory ops failed)
    if (!failed) {
      for (const op of contract.fileOperations) {
        const opStartTime = Date.now();
        try {
          if (op.operationType === 'CREATE_FILE') {
            await backupManager.recordBackup(op.filePath, fs);
            await fs.writeFile(op.filePath, op.content);
          } else if (op.operationType === 'MODIFY_FILE') {
            await backupManager.recordBackup(op.filePath, fs);
            await fs.writeFile(op.filePath, op.content);
          } else if (op.operationType === 'DELETE_FILE') {
            await backupManager.recordBackup(op.filePath, fs);
            await fs.deleteFile(op.filePath);
          } else if (op.operationType === 'RENAME_FILE' || op.operationType === 'MOVE_FILE') {
            // Backup both source and destination
            await backupManager.recordBackup(op.filePath, fs);
            // In rename/move, content field can contain destination path or we resolve from reason
            // Let's assume content contains destination path for rename/move operations
            const destPath = op.content; 
            await backupManager.recordBackup(destPath, fs);
            await fs.rename(op.filePath, destPath);
          }
          
          completedOperations.push(op.operationId);
          logs.push({
            operationId: op.operationId,
            path: op.filePath,
            status: 'COMPLETED',
            durationMs: Date.now() - opStartTime
          });
        } catch (err: any) {
          failed = true;
          failedOperations.push(op.operationId);
          errors.push(`File operation '${op.operationId}' failed on '${op.filePath}': ${err.message}`);
          logs.push({
            operationId: op.operationId,
            path: op.filePath,
            status: 'FAILED',
            durationMs: Date.now() - opStartTime,
            error: err.message
          });
          break;
        }
      }
    }

    // 3. Rollback triggers if any operation fails
    if (failed) {
      const rollbackSuccess = await backupManager.performRollback(fs);
      rollbackStatus = rollbackSuccess ? 'SUCCESSFUL' : 'FAILED';
    }

    return {
      completedOperations: Object.freeze(completedOperations),
      failedOperations: Object.freeze(failedOperations),
      skippedOperations: Object.freeze(skippedOperations),
      rollbackStatus,
      logs: Object.freeze(logs),
      warnings: Object.freeze([...warnings, ...contract.warnings]),
      errors: Object.freeze(errors)
    };
  }
}

export const operationExecutor = new OperationExecutor();
export default operationExecutor;

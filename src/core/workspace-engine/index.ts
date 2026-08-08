import { operationExecutor } from './executor';
import { IGenerationContract } from '../generation-contract/types';
import { IWorkspaceExecutionReport } from './types';
import { IFilesystemAdapter } from './fs-adapter';

export class WorkspaceEngine {
  public async applyChanges(
    contract: IGenerationContract,
    fsAdapter: IFilesystemAdapter
  ): Promise<IWorkspaceExecutionReport> {
    const report = await operationExecutor.executeContract(contract, fsAdapter);
    return this.deepFreeze(report);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const workspaceEngine = new WorkspaceEngine();
export default workspaceEngine;
export * from './types';
export * from './fs-adapter';
export { BackupManager } from './backup';
export { OperationExecutor } from './executor';

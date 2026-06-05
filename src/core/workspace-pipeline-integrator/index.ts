import { workspacePipelineIntegrator } from './integrator';
import { IGenerationContract } from '../generation-contract/types';
import { IFilesystemAdapter } from '../workspace-engine/fs-adapter';
import { IIntegratedWorkspaceReport } from './types';

export class WorkspacePipelineFacade {
  public async applyContracts(
    contracts: readonly IGenerationContract[],
    fsAdapter: IFilesystemAdapter
  ): Promise<IIntegratedWorkspaceReport> {
    console.log('[TRACE] [Workspace Engine] ENTER: applyContracts. Total Contracts:', contracts.length);
    const report = await workspacePipelineIntegrator.integrateAndApply(contracts, fsAdapter);
    console.log('[TRACE] [Workspace Engine] EXIT: applyContracts completed. Files written:', report.createdFiles.length);
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

export const workspacePipelineFacade = new WorkspacePipelineFacade();
export default workspacePipelineFacade;
export * from './types';
export { WorkspacePipelineIntegrator } from './integrator';

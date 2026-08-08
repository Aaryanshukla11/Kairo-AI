import { IGenerationContract } from '../generation-contract/types';

export interface IModuleGenerationResult {
  readonly moduleName: string;
  readonly status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
  readonly contract: IGenerationContract | null;
  readonly errors: readonly string[];
}

export interface IGenerationResult {
  readonly executionId: string;
  readonly completedModules: readonly string[];
  readonly failedModules: readonly string[];
  readonly generatedContracts: readonly IGenerationContract[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

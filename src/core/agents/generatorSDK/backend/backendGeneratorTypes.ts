export type BackendGeneratorStage =
  | 'BACKEND_GENERATION_STARTED'
  | 'MANIFEST_VALIDATION'
  | 'MODULE_PLANNING'
  | 'CODE_GENERATION'
  | 'DEPENDENCY_VALIDATION'
  | 'FILE_VALIDATION'
  | 'DISK_WRITE'
  | 'GENERATION_SUMMARY'
  | 'ERRORS_AND_WARNINGS';

export interface IBackendGeneratorLog {
  readonly stage: BackendGeneratorStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IBackendGenerationResult {
  readonly requestId: string;
  readonly sessionId: string;
  readonly generatorName: string;
  readonly generatedFiles: readonly string[];
  readonly updatedFiles: readonly string[];
  readonly skippedFiles: readonly string[];
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly dependencyValidationStatus: 'PASSED' | 'FAILED';
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly executionTime: number;
  readonly rollbackInformation: {
    readonly checkpointId: string;
    readonly status: 'ACTIVE' | 'COMMITTED' | 'ROLLED_BACK';
  };
}

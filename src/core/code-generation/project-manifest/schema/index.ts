export interface IPlannedFile {
  path: string;
  purpose: string;
  ownerGeneratorId: string;
  dependencies: string[];
  generationStage: string;
  regenerationPolicy: 'OVERWRITE' | 'PROTECT' | 'MERGE';
  fileModality: 'AI_MANAGED' | 'MANUAL' | 'PROTECTED';
}

export interface IExecutionStep {
  stageName: string;
  generatorId: string;
  executionPriority: number;
  retryCount: number;
  failureAction: 'ABORT' | 'CONTINUE' | 'ROLLBACK';
  validationRules: string[];
}

export interface IRollbackCheckpoint {
  checkpointId: string;
  stageName: string;
  recoveryActions: string[];
}

export interface IProjectManifest {
  readonly projectName: string;
  readonly schemaVersion: string;
  readonly plannedFiles: IPlannedFile[];
  readonly executionPlan: {
    steps: IExecutionStep[];
  };
  readonly rollbackStrategy: {
    checkpoints: IRollbackCheckpoint[];
  };
  readonly validationReport: {
    isValid: boolean;
    violations: string[];
  };
}

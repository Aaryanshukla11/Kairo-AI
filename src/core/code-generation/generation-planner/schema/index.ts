export interface IGenerationTask {
  id: string;
  name: string;
  description: string;
  assignedGeneratorId: string;
  priority: number;
  dependencies: string[]; // Task IDs
  expectedOutputs: string[];
  validationRules: string[];
  rollbackPointId: string;
  maxRetries: number;
  retryDelayMs: number;
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedDurationSeconds: number;
  failureStrategy: 'ABORT' | 'ROLLBACK' | 'CONTINUE';
}

export interface ITaskDependencyEdge {
  from: string;
  to: string;
}

export interface ITaskGraph {
  nodes: IGenerationTask[];
  edges: ITaskDependencyEdge[];
}

export interface ICheckpointNode {
  checkpointId: string;
  checkpointName: string;
  dependentTaskIds: string[];
  rollbackCheckpointId?: string;
}

export interface IGenerationPlan {
  readonly planId: string;
  readonly taskGraph: ITaskGraph;
  readonly orderedTaskList: IGenerationTask[];
  readonly parallelGroups: string[][]; // Array of Task IDs that can run concurrently
  readonly checkpoints: ICheckpointNode[];
  readonly validationReport: {
    isValid: boolean;
    violations: string[];
  };
}

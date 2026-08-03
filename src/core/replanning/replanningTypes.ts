export enum ReplanTriggerType {
  TaskFailure = 'TaskFailure',
  DependencyFailure = 'DependencyFailure',
  PolicyChange = 'PolicyChange',
  UserIntervention = 'UserIntervention',
  WorkspaceChange = 'WorkspaceChange',
  ArchitectureChange = 'ArchitectureChange',
  ResourceLimitation = 'ResourceLimitation',
  ExecutionTimeout = 'ExecutionTimeout'
}

export enum ReplanStrategyType {
  Partial = 'Partial',
  Incremental = 'Incremental',
  Milestone = 'Milestone',
  Dependency = 'Dependency',
  Recovery = 'Recovery',
  Full = 'Full'
}

export interface ReplanTrigger {
  id: string;
  type: ReplanTriggerType;
  sourceId: string;
  reason: string;
  timestamp: number;
}

export interface ImpactAnalysisResult {
  triggerId: string;
  affectedTaskIds: string[];
  affectedMilestoneIds: string[];
  preservedTaskIds: string[];
  preservedMilestoneIds: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ExecutionDelta {
  addedTasks: string[];
  removedTasks: string[];
  modifiedTasks: string[];
  preservedTasks: string[];
}

export interface ReplanConflict {
  id: string;
  type: 'DependencyOverlap' | 'ResourceContention' | 'MilestoneMismatch';
  description: string;
  resolved: boolean;
  resolutionStrategy: string;
}

export interface ReplanningReport {
  reportId: string;
  timestamp: number;
  workflowId: string;
  trigger: ReplanTrigger;
  strategy: ReplanStrategyType;
  impact: ImpactAnalysisResult;
  delta: ExecutionDelta;
  conflicts: ReplanConflict[];
  updatedExecutionOrder: string[];
  recoverySuggestions: string[];
  confidence: number; // 0 to 1
  validationResult: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface ReplanningInput {
  workflowId?: string;
  triggerType?: ReplanTriggerType;
  failedSourceId?: string;
  strategy?: ReplanStrategyType;
  context?: Record<string, any>;
}

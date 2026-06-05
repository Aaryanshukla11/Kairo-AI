import { TaskGraph, TaskModel, TaskPriority, TaskRiskLevel } from '../taskGeneration/taskTypes';

export type ExecutionStrategyType =
  | 'Sequential'
  | 'Parallel'
  | 'Hybrid'
  | 'Isolated'
  | 'Manual';

export interface CheckpointModel {
  checkpointId: string;
  parentTasks: string[];
  completedTasks: string[];
  workspaceSnapshot: string;
  rollbackBoundary: string;
  verificationRules: string[];
  timestamp: number;
}

export interface RollbackBoundary {
  boundaryId: string;
  checkpointId: string;
  affectedTaskIds: string[];
  affectedFiles: string[];
  estimatedRollbackTimeMs: number;
  isIsolated: boolean;
}

export interface ResourcePlan {
  cpuLimitPercent: number;
  memoryLimitMB: number;
  diskLimitMB: number;
  contextWindowTokens: number;
  estimatedTokens: number;
  estimatedRuntimeMs: number;
  maxConcurrentWorkers: number;
}

export interface ExecutionStep {
  stepId: string;
  taskId: string;
  taskTitle: string;
  strategy: ExecutionStrategyType;
  workerIndex: number;
  estimatedStartTimeMs: number;
  estimatedDurationMs: number;
  checkpointId?: string;
  dependencies: string[]; // Step IDs
}

export interface ExecutionSchedule {
  steps: ExecutionStep[];
  parallelGroups: string[][]; // Array of Step IDs that run in parallel
  totalTimeSlots: number;
  estimatedTotalRuntimeMs: number;
}

export interface ExecutionPlan {
  planId: string;
  taskGraphId?: string;
  strategy: ExecutionStrategyType;
  schedule: ExecutionSchedule;
  checkpointPlan: CheckpointModel[];
  rollbackBoundaries: RollbackBoundary[];
  resourcePlan: ResourcePlan;
  overallRisk: TaskRiskLevel;
  totalTasks: number;
}

export interface ExecutionPlanningInput {
  taskGraph: TaskGraph;
  workspaceContext?: any;
  executionPolicies?: {
    maxWorkers?: number;
    preferParallelism?: boolean;
    checkpointFrequency?: 'High' | 'Medium' | 'Low';
    allowIsolatedWorkers?: boolean;
  };
  executionContext?: any;
  resourceConstraints?: {
    maxMemoryMB?: number;
    maxCpuPercent?: number;
    maxTokensLimit?: number;
  };
}

export interface ExecutionPlanningReport {
  reportId: string;
  planId: string;
  executionPlan: ExecutionPlan;
  executionGraph: {
    nodesCount: number;
    edgesCount: number;
    criticalPathLength: number;
  };
  confidence: number; // 0.0 - 1.0
  validationPassed: boolean;
  validationErrors: string[];
  timestamp: number;
}

export enum MilestoneState {
  Created = 'Created',
  Planned = 'Planned',
  Waiting = 'Waiting',
  Running = 'Running',
  Paused = 'Paused',
  Completed = 'Completed',
  RolledBack = 'RolledBack',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  Recovered = 'Recovered'
}

export enum MilestoneStrategyType {
  Sequential = 'Sequential',
  Parallel = 'Parallel',
  Hybrid = 'Hybrid',
  Conditional = 'Conditional',
  Isolated = 'Isolated',
  ManualApproval = 'ManualApproval'
}

export interface MilestoneNode {
  id: string;
  title: string;
  description: string;
  status: MilestoneState;
  priority: number;
  dependencies: string[];
  tasks: string[];
  parallelGroups: string[][];
  checkpoints: string[];
  rollbackBoundary?: string;
  estimatedRuntime: number; // in milliseconds
  estimatedTokens: number;
  confidence: number; // 0 to 1
  metadata?: Record<string, any>;
}

export interface MilestoneWorkflow {
  id: string;
  title: string;
  strategy: MilestoneStrategyType;
  milestones: MilestoneNode[];
  executionOrder: string[];
  parallelMilestones: string[][];
  criticalPath: string[];
  totalEstimatedRuntime: number;
  totalEstimatedTokens: number;
}

export interface MilestoneCheckpoint {
  checkpointId: string;
  milestoneId: string;
  completedTasks: string[];
  workspaceSnapshot: string;
  recoveryPoint: string;
  verificationStatus: 'Verified' | 'Pending' | 'Failed';
  timestamp: number;
}

export interface MilestoneRecoveryPlan {
  recoveryPlanId: string;
  milestoneId: string;
  rollbackBoundaryId: string;
  fallbackSteps: string[];
  retryCount: number;
  maxRetries: number;
  compensationActions: string[];
  recoveryConfidence: number;
}

export interface MilestoneOrchestrationMetrics {
  totalMilestones: number;
  completedMilestones: number;
  failedMilestones: number;
  totalCheckpoints: number;
  totalRecoveryPlans: number;
  avgConfidence: number;
  totalRuntimeMs: number;
  totalTokens: number;
}

export interface MilestoneOrchestrationReport {
  reportId: string;
  timestamp: number;
  executionPlanId: string;
  workflow: MilestoneWorkflow;
  checkpoints: MilestoneCheckpoint[];
  recoveryPlans: MilestoneRecoveryPlan[];
  executionConfidence: number;
  metrics: MilestoneOrchestrationMetrics;
  validationResult: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface MilestoneOrchestrationInput {
  executionPlanId?: string;
  strategy?: MilestoneStrategyType;
  customMilestones?: Partial<MilestoneNode>[];
  context?: Record<string, any>;
}

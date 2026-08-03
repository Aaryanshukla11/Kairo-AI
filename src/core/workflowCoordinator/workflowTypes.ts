export enum WorkflowState {
  Created = 'Created',
  Queued = 'Queued',
  Scheduled = 'Scheduled',
  Running = 'Running',
  Waiting = 'Waiting',
  Paused = 'Paused',
  Retrying = 'Retrying',
  Recovering = 'Recovering',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Failed = 'Failed'
}

export enum WorkflowStrategyType {
  Sequential = 'Sequential',
  Parallel = 'Parallel',
  Conditional = 'Conditional',
  Recovery = 'Recovery',
  Approval = 'Approval'
}

export enum QueueType {
  Priority = 'Priority',
  FIFO = 'FIFO',
  Dependency = 'Dependency',
  Parallel = 'Parallel',
  Recovery = 'Recovery'
}

export enum RetryPolicyType {
  Immediate = 'Immediate',
  Delayed = 'Delayed',
  ExponentialBackoff = 'ExponentialBackoff',
  Conditional = 'Conditional',
  PolicyBased = 'PolicyBased',
  Manual = 'Manual'
}

export interface WorkflowStage {
  id: string;
  name: string;
  engine: string;
  status: WorkflowState;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  estimatedRuntimeMs: number;
  confidence: number;
}

export interface WorkflowGraph {
  id: string;
  name: string;
  strategy: WorkflowStrategyType;
  stages: WorkflowStage[];
  executionOrder: string[];
  parallelGroups: string[][];
  criticalPath: string[];
}

export interface WorkflowContextModel {
  workflowId: string;
  startTime: number;
  activeStageId?: string;
  variables: Record<string, any>;
  environment: string;
  sessionToken: string;
}

export interface WorkflowRetryItem {
  id: string;
  workflowId: string;
  stageId: string;
  attempt: number;
  maxAttempts: number;
  policy: RetryPolicyType;
  delayMs: number;
  lastError?: string;
  timestamp: number;
}

export interface WorkflowPolicyRule {
  id: string;
  name: string;
  type: 'ExecutionLimit' | 'DependencyRequirement' | 'ApprovalRequirement' | 'ResourceLimit' | 'WorkspaceIntegrity' | 'RollbackEligibility';
  enforced: boolean;
  severity: 'Block' | 'Warn' | 'Allow';
}

export interface WorkflowMetricsModel {
  totalWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  retriedWorkflows: number;
  totalStagesExecuted: number;
  avgConfidence: number;
  totalRuntimeMs: number;
}

export interface WorkflowCoordinatorReport {
  reportId: string;
  workflowId: string;
  timestamp: number;
  graph: WorkflowGraph;
  context: WorkflowContextModel;
  executionQueue: string[];
  executionTimeline: { stageId: string; state: WorkflowState; durationMs: number }[];
  retries: WorkflowRetryItem[];
  policyRules: WorkflowPolicyRule[];
  executionConfidence: number;
  metrics: WorkflowMetricsModel;
  validationResult: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface WorkflowCoordinatorInput {
  workflowId?: string;
  strategy?: WorkflowStrategyType;
  queueType?: QueueType;
  featurePlan?: any;
  executionPlan?: any;
  context?: Record<string, any>;
}

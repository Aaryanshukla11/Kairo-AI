import { PromptPackage } from '../../promptAssembly/promptTypes';

export enum PlanningStrategyType {
  FeatureDevelopment = 'FeatureDevelopment',
  BugFix = 'BugFix',
  Refactoring = 'Refactoring',
  Architecture = 'Architecture',
  Documentation = 'Documentation',
  Testing = 'Testing',
  Migration = 'Migration'
}

export enum PlannerTaskType {
  Create = 'Create',
  Modify = 'Modify',
  Delete = 'Delete',
  Rename = 'Rename',
  Move = 'Move',
  Analyze = 'Analyze',
  Review = 'Review',
  Test = 'Test',
  Refactor = 'Refactor'
}

export interface PlannerTaskItem {
  id: string;
  title: string;
  type: PlannerTaskType;
  description: string;
  affectedFiles: string[];
  dependencies: string[];
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  summary: string;
  strategy: PlanningStrategyType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDurationMin: number;
  affectedFiles: string[];
  dependencies: string[];
  tasks: PlannerTaskItem[];
  riskAssessment: {
    complexity: 'low' | 'medium' | 'high';
    riskScore: number;
    mitigationStrategy: string;
  };
  validationSummary: {
    valid: boolean;
    errors: string[];
  };
}

export enum PlannerEventType {
  PlanningStarted = 'PlanningStarted',
  TaskCreated = 'TaskCreated',
  PlanValidated = 'PlanValidated',
  PlanCompleted = 'PlanCompleted',
  PlanningFailed = 'PlanningFailed'
}

export interface PlannerEvent {
  type: PlannerEventType;
  timestamp: number;
  payload?: any;
}

export type PlannerEventListener = (event: PlannerEvent) => void;

export type PlannerAgentStage =
  | 'PLANNING_STARTED'
  | 'DEPENDENCY_RESOLUTION'
  | 'GENERATOR_ASSIGNMENT'
  | 'EXECUTION_QUEUE_CREATION'
  | 'VALIDATION'
  | 'GENERATION_PLAN_CREATED'
  | 'PLAN_RETURNED';

export interface IPlannerAgentLog {
  readonly stage: PlannerAgentStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IGeneratorTask {
  readonly id: string;
  readonly title: string;
  readonly generatorId: string;
  readonly stage: string;
  readonly targetFiles: readonly string[];
  readonly dependencies: readonly string[];
}

export interface IGenerationPlanObject {
  readonly requestId: string;
  readonly sessionId: string;
  readonly executionStages: readonly string[];
  readonly orderedTaskList: readonly IGeneratorTask[];
  readonly generatorMapping: Record<string, readonly string[]>;
  readonly dependencyGraph: {
    readonly nodes: readonly { id: string; name: string }[];
    readonly edges: readonly { from: string; to: string }[];
    readonly valid: boolean;
  };
  readonly parallelGroups: readonly (readonly string[])[];
  readonly validationRules: readonly string[];
  readonly retryRules: {
    readonly maxRetries: number;
    readonly backoffMs: number;
    readonly retryableErrors: readonly string[];
  };
  readonly rollbackStrategy: {
    readonly checkpointIds: readonly string[];
    readonly autoRollbackOnFailure: boolean;
  };
  readonly estimatedExecutionTimeline: {
    readonly totalEstimatedMs: number;
    readonly stageBreakdownMs: Record<string, number>;
  };
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly validationErrors?: readonly string[];
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}


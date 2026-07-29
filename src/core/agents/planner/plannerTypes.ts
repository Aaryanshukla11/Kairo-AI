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

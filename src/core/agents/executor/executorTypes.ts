import { ExecutionPlan } from '../planner/plannerTypes';

export enum ExecutorTaskState {
  Pending = 'Pending',
  Queued = 'Queued',
  Running = 'Running',
  Paused = 'Paused',
  Completed = 'Completed',
  Skipped = 'Skipped',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

export interface ExecutionReport {
  executionId: string;
  planId: string;
  completedTasks: string[];
  skippedTasks: string[];
  failedTasks: string[];
  executionTimeMs: number;
  toolUsage: string[];
  generatedArtifacts: string[];
  logs: string[];
}

export enum ExecutorEventType {
  ExecutionStarted = 'ExecutionStarted',
  TaskStarted = 'TaskStarted',
  ToolInvoked = 'ToolInvoked',
  TaskCompleted = 'TaskCompleted',
  TaskFailed = 'TaskFailed',
  ExecutionPaused = 'ExecutionPaused',
  ExecutionResumed = 'ExecutionResumed',
  ExecutionCompleted = 'ExecutionCompleted',
  ExecutionCancelled = 'ExecutionCancelled'
}

export interface ExecutorEvent {
  type: ExecutorEventType;
  timestamp: number;
  payload?: any;
}

export type ExecutorEventListener = (event: ExecutorEvent) => void;

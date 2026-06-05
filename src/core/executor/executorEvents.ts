export enum ExecutorEventType {
  ExecutionStarted = 'ExecutionStarted',
  NodeStarted = 'NodeStarted',
  NodeCompleted = 'NodeCompleted',
  NodeFailed = 'NodeFailed',
  ExecutionPaused = 'ExecutionPaused',
  ExecutionResumed = 'ExecutionResumed',
  ExecutionCancelled = 'ExecutionCancelled',
  ExecutionCompleted = 'ExecutionCompleted'
}

export interface ExecutorEvent {
  type: ExecutorEventType;
  executorId: string;
  graphId: string;
  timestamp: number;
  payload?: any;
}

export type ExecutorEventListener = (event: ExecutorEvent) => void;

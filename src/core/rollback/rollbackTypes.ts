export enum RollbackStatus {
  Pending = 'Pending',
  Ready = 'Ready',
  Executing = 'Executing',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

export interface RollbackInfo {
  id: string;
  patchId: string;
  operationId: string;
  affectedFiles: string[];
  previousState: Record<string, string>; // filePath -> oldContent
  rollbackPlan: string;
  status: RollbackStatus;
  createdAt: number;
  metadata?: Record<string, any>;
}

export enum RollbackEventType {
  RollbackCreated = 'RollbackCreated',
  RollbackValidated = 'RollbackValidated',
  RollbackStarted = 'RollbackStarted',
  RollbackCompleted = 'RollbackCompleted',
  RollbackFailed = 'RollbackFailed'
}

export interface RollbackEvent {
  type: RollbackEventType;
  rollbackId: string;
  timestamp: number;
  payload?: any;
}

export type RollbackEventListener = (event: RollbackEvent) => void;

export interface RollbackPreviewData {
  affectedFiles: string[];
  linesRestored: number;
  linesRemoved: number;
  estimatedImpact: string;
}

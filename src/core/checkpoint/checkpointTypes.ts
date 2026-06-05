export enum CheckpointStatus {
  Created = 'Created',
  Active = 'Active',
  Restoring = 'Restoring',
  Restored = 'Restored',
  Expired = 'Expired',
  Deleted = 'Deleted'
}

export interface CheckpointInfo {
  id: string;
  workspaceId: string;
  transactionId: string;
  timestamp: number;
  status: CheckpointStatus;
  affectedFiles: string[];
  workspaceHash: string;
  metadata?: Record<string, any>;
}

export enum CheckpointEventType {
  CheckpointCreated = 'CheckpointCreated',
  CheckpointLoaded = 'CheckpointLoaded',
  CheckpointRestored = 'CheckpointRestored',
  CheckpointDeleted = 'CheckpointDeleted',
  CheckpointExpired = 'CheckpointExpired'
}

export interface CheckpointEvent {
  type: CheckpointEventType;
  checkpointId: string;
  timestamp: number;
  payload?: any;
}

export type CheckpointEventListener = (event: CheckpointEvent) => void;

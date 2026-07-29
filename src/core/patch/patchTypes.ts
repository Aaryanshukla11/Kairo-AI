export enum ChangeType {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Rename = 'Rename',
  Move = 'Move'
}

export enum PatchStatus {
  Draft = 'Draft',
  Generated = 'Generated',
  Validated = 'Validated',
  Approved = 'Approved',
  Applied = 'Applied',
  Rejected = 'Rejected',
  RolledBack = 'RolledBack'
}

export interface Patch {
  id: string;
  operationId: string;
  filePath: string;
  changeType: ChangeType;
  oldContent?: string;
  newContent?: string;
  diff?: string;
  status: PatchStatus;
  createdAt: number;
  metadata?: Record<string, any>;
}

export enum PatchEventType {
  PatchCreated = 'PatchCreated',
  PatchValidated = 'PatchValidated',
  PatchApproved = 'PatchApproved',
  PatchApplied = 'PatchApplied',
  PatchRejected = 'PatchRejected',
  PatchRolledBack = 'PatchRolledBack'
}

export interface PatchEvent {
  type: PatchEventType;
  patchId: string;
  timestamp: number;
  payload?: any;
}

export type PatchEventListener = (event: PatchEvent) => void;

export enum PermissionAction {
  ReadFile = 'ReadFile',
  WriteFile = 'WriteFile',
  DeleteFile = 'DeleteFile',
  RenameFile = 'RenameFile',
  MoveFile = 'MoveFile',
  ExecuteTerminal = 'ExecuteTerminal',
  GitCommit = 'GitCommit',
  NetworkAccess = 'NetworkAccess',
  WorkspaceScan = 'WorkspaceScan',
  PluginAccess = 'PluginAccess'
}

export enum PermissionRiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum PermissionStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Denied = 'Denied',
  Expired = 'Expired',
  Cancelled = 'Cancelled'
}

export enum PermissionPolicy {
  AlwaysAsk = 'AlwaysAsk',
  AskOnce = 'AskOnce',
  AllowForSession = 'AllowForSession',
  AlwaysAllow = 'AlwaysAllow',
  AlwaysDeny = 'AlwaysDeny'
}

export interface PermissionRequest {
  id: string;
  operationId?: string;
  resource: string;
  action: PermissionAction;
  riskLevel: PermissionRiskLevel;
  reason: string;
  requestedBy: string;
  requestedAt: number;
  status: PermissionStatus;
  policyUsed?: PermissionPolicy;
}

export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  status: PermissionStatus;
  policyApplied?: PermissionPolicy;
  timestamp: number;
}

export enum PermissionEventType {
  PermissionRequested = 'PermissionRequested',
  PermissionApproved = 'PermissionApproved',
  PermissionDenied = 'PermissionDenied',
  PermissionExpired = 'PermissionExpired'
}

export interface PermissionEvent {
  type: PermissionEventType;
  requestId: string;
  timestamp: number;
  payload?: any;
}

export type PermissionEventListener = (event: PermissionEvent) => void;

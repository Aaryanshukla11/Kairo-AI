export enum DiagnosticSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Critical = 'Critical'
}

export enum DiagnosticCategory {
  Validation = 'Validation',
  Filesystem = 'Filesystem',
  Terminal = 'Terminal',
  Git = 'Git',
  Planner = 'Planner',
  Executor = 'Executor',
  Workspace = 'Workspace',
  Patch = 'Patch',
  Rollback = 'Rollback',
  Checkpoint = 'Checkpoint',
  System = 'System'
}

export enum DiagnosticStatus {
  Open = 'Open',
  Acknowledged = 'Acknowledged',
  Resolved = 'Resolved',
  Ignored = 'Ignored'
}

export interface Diagnostic {
  id: string;
  timestamp: number;
  sourceModule: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  message: string;
  details?: string;
  stackTrace?: string;
  operationId?: string;
  status: DiagnosticStatus;
}

export enum DiagnosticEventType {
  DiagnosticCreated = 'DiagnosticCreated',
  DiagnosticUpdated = 'DiagnosticUpdated',
  DiagnosticResolved = 'DiagnosticResolved',
  DiagnosticIgnored = 'DiagnosticIgnored'
}

export interface DiagnosticEvent {
  type: DiagnosticEventType;
  diagnosticId: string;
  timestamp: number;
  payload?: any;
}

export type DiagnosticEventListener = (event: DiagnosticEvent) => void;

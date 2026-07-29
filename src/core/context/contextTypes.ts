import { Diagnostic } from '../diagnostics/diagnosticsTypes';

export interface ContextWorkspaceInfo {
  rootPath: string;
  projectName?: string;
  packageJson?: any;
  hasGit: boolean;
}

export interface ContextFileInfo {
  filePath: string;
  content: string;
  size: number;
  tokenEstimate: number;
}

export interface ContextSelectionInfo {
  filePath?: string;
  selectedText?: string;
  startLine?: number;
  endLine?: number;
}

export interface ContextPlannerInfo {
  activePlanId?: string;
  planStepsCount?: number;
  planStatus?: string;
}

export interface ContextExecutionInfo {
  graphId?: string;
  nodesExecuted?: number;
  totalNodes?: number;
  status?: string;
}

export interface ContextGitInfo {
  branch?: string;
  statusSummary?: string;
  modifiedFilesCount?: number;
}

export interface ContextMetadata {
  tokenEstimateTotal: number;
  sizeBytesTotal: number;
  limitBytes: number;
}

export interface ProjectContext {
  id: string;
  workspace: ContextWorkspaceInfo;
  files: ContextFileInfo[];
  selection: ContextSelectionInfo;
  planner: ContextPlannerInfo;
  execution: ContextExecutionInfo;
  git: ContextGitInfo;
  diagnostics: Diagnostic[];
  metadata: ContextMetadata;
  timestamp: number;
}

export enum ContextEventType {
  ContextRequested = 'ContextRequested',
  ContextBuilt = 'ContextBuilt',
  ContextUpdated = 'ContextUpdated',
  ContextExpired = 'ContextExpired'
}

export interface ContextEvent {
  type: ContextEventType;
  contextId: string;
  timestamp: number;
  payload?: any;
}

export type ContextEventListener = (event: ContextEvent) => void;

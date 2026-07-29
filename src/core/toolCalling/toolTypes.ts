export enum ToolCategory {
  Filesystem = 'Filesystem',
  Workspace = 'Workspace',
  Terminal = 'Terminal',
  Git = 'Git',
  Planner = 'Planner',
  Patch = 'Patch',
  Rollback = 'Rollback',
  Checkpoint = 'Checkpoint',
  Diagnostics = 'Diagnostics',
  Memory = 'Memory',
  Retriever = 'Retriever'
}

export enum ToolStatus {
  Registered = 'Registered',
  Available = 'Available',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Disabled = 'Disabled'
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  version: string;
  permissions: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  status: ToolStatus;
}

export interface ToolExecutionRequest {
  toolId: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolId: string;
  success: boolean;
  result?: any;
  error?: string;
  latencyMs: number;
}

export enum ToolCallingEventType {
  ToolRegistered = 'ToolRegistered',
  ToolRequested = 'ToolRequested',
  ToolStarted = 'ToolStarted',
  ToolCompleted = 'ToolCompleted',
  ToolFailed = 'ToolFailed',
  ToolDisabled = 'ToolDisabled'
}

export interface ToolCallingEvent {
  type: ToolCallingEventType;
  toolId: string;
  timestamp: number;
  payload?: any;
}

export type ToolCallingEventListener = (event: ToolCallingEvent) => void;

export enum AgentStatus {
  Idle = 'Idle',
  Preparing = 'Preparing',
  Running = 'Running',
  Waiting = 'Waiting',
  Completed = 'Completed',
  Failed = 'Failed',
  Stopped = 'Stopped'
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  version: string;
  status: AgentStatus;
  priority: number;
  capabilities: string[];
  permissions: string[];
}

export interface AgentTask {
  id: string;
  title: string;
  assignedAgentId: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export enum AgentEventType {
  AgentRegistered = 'AgentRegistered',
  AgentStarted = 'AgentStarted',
  AgentStopped = 'AgentStopped',
  AgentTaskAssigned = 'AgentTaskAssigned',
  AgentTaskCompleted = 'AgentTaskCompleted',
  AgentFailed = 'AgentFailed'
}

export interface AgentEvent {
  type: AgentEventType;
  agentId: string;
  timestamp: number;
  payload?: any;
}

export type AgentEventListener = (event: AgentEvent) => void;

export type AgentManagerStage =
  | 'REGISTRATION'
  | 'AGENT_SELECTION'
  | 'TASK_DISPATCH'
  | 'TASK_COMPLETED'
  | 'TASK_FAILED';

export interface IAgentManagerLog {
  readonly stage: AgentManagerStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}


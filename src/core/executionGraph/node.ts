import { RiskLevel } from '../planner/types';

export enum NodeStatus {
  Waiting = 'Waiting',
  Ready = 'Ready',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Skipped = 'Skipped',
  Blocked = 'Blocked'
}

export interface ExecutionNode {
  id: string;
  title: string;
  description: string;
  type: string;
  status: NodeStatus;
  estimatedTime: number;
  riskLevel: RiskLevel;
  metadata?: Record<string, any>;
}

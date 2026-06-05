export enum TaskStatus {
  Pending = 'Pending',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  WaitingApproval = 'WaitingApproval'
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dependencies: string[]; // array of Task IDs this task depends on
  estimatedTime: string;  // e.g. '5m', '1h'
  targetFiles?: string[];
  requiredCapability?: string;
  generatorId?: string;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  summary: string;
  estimatedSteps: number;
  estimatedFiles: number;
  riskLevel: RiskLevel;
  tasks: Task[];
  targetFiles?: string[];
  requiredCapability?: string;
}

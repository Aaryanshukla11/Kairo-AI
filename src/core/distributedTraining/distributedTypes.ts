export type WorkerState =
  | 'Registered'
  | 'Idle'
  | 'Preparing'
  | 'Training'
  | 'Synchronizing'
  | 'Waiting'
  | 'Recovering'
  | 'Completed'
  | 'Failed'
  | 'Disconnected';

export type DistributedMode =
  | 'Single GPU'
  | 'Multi GPU'
  | 'Multi Device'
  | 'Multi Node'
  | 'Future Cloud Cluster';

export interface WorkerModel {
  workerId: string;
  nodeId: string;
  gpuId: number;
  state: WorkerState;
  gpuUsagePercent: number;
  vramUsageMB: number;
  throughputTokensPerSec: number;
  isHealthy: boolean;
  lastHeartbeat: number;
}

export interface NodeModel {
  nodeId: string;
  ipAddress: string;
  ramUsagePercent: number;
  cpuUsagePercent: number;
  workersCount: number;
  status: 'online' | 'offline';
}

export interface DistributedSessionModel {
  sessionId: string;
  mode: DistributedMode;
  clusterId: string;
  workers: WorkerModel[];
  nodes: NodeModel[];
  createdAt: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
}

export interface ClusterReportModel {
  clusterId: string;
  totalWorkers: number;
  activeWorkers: number;
  failedWorkers: number;
  averageThroughput: number;
  totalGpuMemoryUsedMB: number;
  healthyNodesCount: number;
}

export interface SynchronizationReportModel {
  syncId: string;
  timestamp: number;
  barrierDurationMs: number;
  success: boolean;
  mismatchedWorkers: string[];
}

export enum DistributedEventType {
  ClusterCreated = 'ClusterCreated',
  WorkersRegistered = 'WorkersRegistered',
  TasksAssigned = 'TasksAssigned',
  StateSynchronized = 'StateSynchronized',
  TrainingExecuted = 'TrainingExecuted',
  HealthMonitored = 'HealthMonitored',
  MetricsAggregated = 'MetricsAggregated',
  CheckpointsUpdated = 'CheckpointsUpdated',
  WorkerStateChanged = 'WorkerStateChanged'
}

export interface DistributedEvent {
  type: DistributedEventType;
  timestamp: number;
  payload?: any;
}

export type DistributedEventListener = (event: DistributedEvent) => void;

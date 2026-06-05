export type LossStrategy =
  | 'Cross Entropy'
  | 'Focal Loss'
  | 'Mean Squared Error'
  | 'Custom Loss'
  | 'Future Provider Losses';

export type ConvergenceStatus =
  | 'Stable convergence'
  | 'Plateau'
  | 'Divergence'
  | 'Oscillation'
  | 'Slow convergence'
  | 'Unknown';

export interface LossReportModel {
  reportId: string;
  sessionId: string;
  strategy: LossStrategy;
  currentLoss: number;
  averageLoss: number;
  minLoss: number;
  maxLoss: number;
  lossVariance: number;
  movingAverage: number;
  lossTrend: 'decreasing' | 'increasing' | 'stable';
  createdAt: number;
}

export interface ConvergenceReportModel {
  status: ConvergenceStatus;
  slope: number;
  message: string;
}

export interface ValidationReportModel {
  isValid: boolean;
  errors: string[];
}

export interface LossManifestModel {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum LossEventType {
  OutputsReceived = 'OutputsReceived',
  StrategySelected = 'StrategySelected',
  InputsValidated = 'InputsValidated',
  LossComputed = 'LossComputed',
  StatsAggregated = 'StatsAggregated',
  ConvergenceAnalyzed = 'ConvergenceAnalyzed',
  MetricsPublished = 'MetricsPublished',
  ReportsGenerated = 'ReportsGenerated'
}

export interface LossEvent {
  type: LossEventType;
  timestamp: number;
  payload?: any;
}

export type LossEventListener = (event: LossEvent) => void;


export type ValidationMode =
  | 'epoch_end'
  | 'fixed_interval'
  | 'checkpoint'
  | 'manual'
  | 'continuous';

export interface ValidationMetricModel {
  validationLoss: number;
  accuracy: number;
  perplexity: number;
  passRate: number;
  inferenceTimeMs: number;
  tokensPerSec: number;
  memoryUsageMB: number;
  benchmarkScore: number;
}

export interface OverfittingReport {
  lossDivergence: boolean;
  accuracyDegradation: boolean;
  validationPlateau: boolean;
  metricInstability: boolean;
  generalizationGap: boolean;
  generalizationGapValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'none';
  issues: string[];
}

export interface CheckpointComparison {
  currentCheckpointId: string;
  baselineCheckpointId: string;
  lossDelta: number;
  accuracyDelta: number;
  perplexityDelta: number;
  benchmarkScoreDelta: number;
  isBetter: boolean;
  notes: string;
}

export interface ValidationReportModel {
  reportId: string;
  sessionId: string;
  mode: ValidationMode;
  isValid: boolean;
  errors: string[];
  metrics: ValidationMetricModel;
  overfittingReport: OverfittingReport;
  checkpointComparison?: CheckpointComparison;
  createdAt: number;
}

export interface ValidationManifest {
  manifestId: string;
  sessionId: string;
  checksum: string;
  createdAt: number;
}

export enum ValidationLoopEventType {
  IngestState = 'IngestState',
  DatasetLoaded = 'DatasetLoaded',
  ValidationExecuted = 'ValidationExecuted',
  MetricsCollected = 'MetricsCollected',
  ResultsAggregated = 'ResultsAggregated',
  HistoryCompared = 'HistoryCompared',
  ReportsGenerated = 'ReportsGenerated',
  EventsPublished = 'EventsPublished'
}

export interface ValidationLoopEvent {
  type: ValidationLoopEventType;
  timestamp: number;
  payload?: any;
}

export type ValidationLoopEventListener = (event: ValidationLoopEvent) => void;

export interface EvaluationConfig {
  benchmarkId: string;
  name: string;
  type: 'tokenizer' | 'model' | 'checkpoint' | string;
  config: Record<string, any>;
}

export interface MetricResult {
  accuracy: number;
  passRate: number;
  successRate: number;
  latencyMs: number;
  tokensPerSec: number;
  memoryUsageBytes: number;
  contextEfficiency: number;
  failureRate: number;
  inferenceTimeMs: number;
  benchmarkCoverage: number;
}

export interface BenchmarkReport {
  benchmarkId: string;
  name: string;
  metrics: MetricResult;
  timestamp: number;
  status: 'passed' | 'failed' | string;
  logs: string[];
}

export interface EvaluationReportModel {
  runId: string;
  artifactId: string; // Tokenizer ID or Checkpoint ID
  artifactType: 'tokenizer' | 'model' | 'checkpoint' | string;
  timestamp: number;
  benchmarkReports: BenchmarkReport[];
  aggregatedScore: number; // overall percentage e.g. 85.5
  metadata: Record<string, any>;
}

export interface HistoricalMetricEntry {
  timestamp: number;
  runId: string;
  artifactId: string;
  aggregatedScore: number;
}

export enum EvaluationEventType {
  EvaluationStarted = 'EvaluationStarted',
  ArtifactLoaded = 'ArtifactLoaded',
  SuiteLoaded = 'SuiteLoaded',
  BenchmarkStarted = 'BenchmarkStarted',
  BenchmarkCompleted = 'BenchmarkCompleted',
  ScoresAggregated = 'ScoresAggregated',
  ReportGenerated = 'ReportGenerated',
  ResultRegistered = 'ResultRegistered'
}

export interface EvaluationEvent {
  type: EvaluationEventType;
  timestamp: number;
  payload?: any;
}

export type EvaluationEventListener = (event: EvaluationEvent) => void;

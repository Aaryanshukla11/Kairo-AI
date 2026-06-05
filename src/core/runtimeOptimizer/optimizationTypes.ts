export enum OptimizationStrategy {
  Latency = 'Latency Optimization',
  Memory = 'Memory Optimization',
  Balanced = 'Balanced Optimization',
  HighThroughput = 'High Throughput',
  PowerSaving = 'Power Saving',
  ThermalProtection = 'Thermal Protection'
}

export interface RuntimeMetricsMap {
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  ramUsageGb: number;
  vramUsageGb: number;
  threadCount: number;
  inferenceQueueLength: number;
  contextWindowUsage: number;
  modelCacheHitRatio: number;
  batchSize: number;
  tokensPerSec: number;
  latencyMs: number;
}

export interface OptimizationReport {
  reportId: string;
  timestamp: number;
  currentStrategy: OptimizationStrategy;
  metricsBefore: RuntimeMetricsMap;
  metricsAfter: RuntimeMetricsMap;
  decisions: string[];
  healthStatus: 'Healthy' | 'Degraded' | 'Critical';
}

export enum OptimizationEventType {
  MetricsCollected = 'MetricsCollected',
  PerformanceAnalyzed = 'PerformanceAnalyzed',
  BottlenecksIdentified = 'BottlenecksIdentified',
  PlanGenerated = 'PlanGenerated',
  PlanValidated = 'PlanValidated',
  OptimizationApplied = 'OptimizationApplied',
  ImprovementsVerified = 'ImprovementsVerified',
  MetricsPublished = 'MetricsPublished'
}

export interface OptimizationEvent {
  type: OptimizationEventType;
  timestamp: number;
  payload?: any;
}

export type OptimizationEventListener = (event: OptimizationEvent) => void;

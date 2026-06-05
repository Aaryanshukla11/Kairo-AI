export enum PerformanceLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Acceptable = 'Acceptable',
  NeedsImprovement = 'Needs Improvement',
  Critical = 'Critical'
}

export interface Bottleneck {
  id: string;
  component: string;
  metric: 'CPU' | 'Memory' | 'ExecutionTime' | 'BundleSize';
  value: number | string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface ComplexityReport {
  filePath: string;
  symbolName: string;
  estimatedComplexity: 'O(1)' | 'O(N)' | 'O(N log N)' | 'O(N^2)' | 'O(2^N)';
  reason: string;
}

export interface PerformanceReport {
  performanceId: string;
  overallScore: number; // 0 - 100
  overallLevel: PerformanceLevel;
  detectedBottlenecks: Bottleneck[];
  hotPaths: string[];
  complexityReport: ComplexityReport[];
  memoryUsageMb: number;
  cpuUsagePercent: number;
  bundleSizeKb: number;
  buildTimeMs: number;
  optimizationSuggestions: string[];
}

export enum PerformanceEventType {
  AnalysisStarted = 'AnalysisStarted',
  BenchmarkCompleted = 'BenchmarkCompleted',
  BottleneckDetected = 'BottleneckDetected',
  OptimizationSuggested = 'OptimizationSuggested',
  PerformanceAnalysisCompleted = 'PerformanceAnalysisCompleted'
}

export interface PerformanceEvent {
  type: PerformanceEventType;
  timestamp: number;
  payload?: any;
}

export type PerformanceEventListener = (event: PerformanceEvent) => void;

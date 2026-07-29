export enum DebugType {
  RuntimeErrors = 'Runtime Errors',
  CompileErrors = 'Compile Errors',
  TypeErrors = 'Type Errors',
  LogicErrors = 'Logic Errors',
  ConfigurationErrors = 'Configuration Errors',
  DependencyErrors = 'Dependency Errors',
  BuildFailures = 'Build Failures',
  TestFailures = 'Test Failures',
  PerformanceRegressions = 'Performance Regressions'
}

export enum ConfidenceLevel {
  VeryLow = 'Very Low',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'Very High'
}

export interface Hypothesis {
  id: string;
  rank: number;
  description: string;
  confidence: ConfidenceLevel;
  likelihood: number; // 0 - 100
}

export interface DebugReport {
  debugId: string;
  failureSummary: string;
  probableRootCause: string;
  alternativeHypotheses: Hypothesis[];
  confidenceScore: number; // 0 - 100
  affectedComponents: string[];
  suggestedNextActions: string[];
  relatedFiles: string[];
}

export enum DebugEventType {
  DebugStarted = 'DebugStarted',
  EvidenceCollected = 'EvidenceCollected',
  RootCauseDetected = 'RootCauseDetected',
  HypothesisGenerated = 'HypothesisGenerated',
  DebugCompleted = 'DebugCompleted'
}

export interface DebugEvent {
  type: DebugEventType;
  timestamp: number;
  payload?: any;
}

export type DebugEventListener = (event: DebugEvent) => void;

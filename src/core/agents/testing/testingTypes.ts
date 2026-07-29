export enum TestType {
  Unit = 'Unit',
  Integration = 'Integration',
  EndToEnd = 'End-to-End',
  Regression = 'Regression',
  Smoke = 'Smoke',
  Performance = 'Performance',
  Accessibility = 'Accessibility',
  StaticAnalysis = 'Static Analysis'
}

export enum RiskLevel {
  Minimal = 'Minimal',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface TestPlan {
  planId: string;
  strategy: string;
  riskLevel: RiskLevel;
  testTypes: TestType[];
  affectedModules: string[];
  targetPaths: string[];
}

export interface TestingReport {
  testingId: string;
  coverageEstimate: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  passedTests: string[];
  failedTests: string[];
  skippedTests: string[];
  warnings: string[];
  recommendations: string[];
  durationMs: number;
}

export enum TestingEventType {
  TestingStarted = 'TestingStarted',
  StrategySelected = 'StrategySelected',
  TestExecuted = 'TestExecuted',
  TestPassed = 'TestPassed',
  TestFailed = 'TestFailed',
  CoverageCalculated = 'CoverageCalculated',
  TestingCompleted = 'TestingCompleted'
}

export interface TestingEvent {
  type: TestingEventType;
  timestamp: number;
  payload?: any;
}

export type TestingEventListener = (event: TestingEvent) => void;

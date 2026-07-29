export enum HealthLevel {
  Healthy = 'Healthy',
  Stable = 'Stable',
  Warning = 'Warning',
  AtRisk = 'At Risk',
  Critical = 'Critical'
}

export interface DependencyNode {
  name: string;
  version: string;
  isDev: boolean;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'dependency' | 'devDependency' | 'import';
}

export interface DependencyReport {
  dependencyId: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  circularDependencies: string[][]; // Lists of cycles paths
  versionConflicts: { packageName: string; required: string; resolved: string }[];
  compatibilityScore: number; // 0 - 100
  healthLevel: HealthLevel;
  licenseSummary: { [licenseName: string]: number };
  impactAnalysis: { packageName: string; dependentsCount: number; severity: 'Low' | 'Medium' | 'High' }[];
  recommendations: string[];
}

export enum DepEventType {
  DependencyScanStarted = 'DependencyScanStarted',
  DependencyDetected = 'DependencyDetected',
  ConflictDetected = 'ConflictDetected',
  CircularDependencyDetected = 'CircularDependencyDetected',
  CompatibilityChecked = 'CompatibilityChecked',
  DependencyAnalysisCompleted = 'DependencyAnalysisCompleted'
}

export interface DepEvent {
  type: DepEventType;
  timestamp: number;
  payload?: any;
}

export type DepEventListener = (event: DepEvent) => void;

export enum ArchViolationType {
  LayerViolation = 'Layer Violation',
  SolidViolation = 'SOLID Violation',
  DependencyInversion = 'Dependency Inversion',
  CyclicModule = 'Cyclic Module',
  FeatureCoupling = 'Feature Coupling',
  PackageCohesion = 'Package Cohesion',
  ModuleCohesion = 'Module Cohesion',
  ResponsibilityOverlap = 'Responsibility Overlap',
  ArchDrift = 'Architecture Drift'
}

export interface ArchGraphNode {
  name: string; // e.g. 'src/core/agents'
  layer: 'webview' | 'extension' | 'core' | 'common';
}

export interface ArchGraphEdge {
  from: string;
  to: string;
}

export interface ArchViolation {
  type: ArchViolationType;
  file: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface ArchitectureReport {
  architectureId: string;
  architectureScore: number; // 0 - 100
  technicalDebtScore: number; // technical debt hours or rating
  layerViolations: ArchViolation[];
  boundaryViolations: ArchViolation[];
  dependencyIssues: string[];
  scalabilityScore: number; // 0 - 100
  maintainabilityScore: number; // 0 - 100
  recommendations: string[];
  nodes: ArchGraphNode[];
  edges: ArchGraphEdge[];
}

export enum ArchEventType {
  ArchitectureAnalysisStarted = 'ArchitectureAnalysisStarted',
  ViolationDetected = 'ViolationDetected',
  DriftDetected = 'DriftDetected',
  RecommendationGenerated = 'RecommendationGenerated',
  ArchitectureAnalysisCompleted = 'ArchitectureAnalysisCompleted'
}

export interface ArchEvent {
  type: ArchEventType;
  timestamp: number;
  payload?: any;
}

export type ArchEventListener = (event: ArchEvent) => void;

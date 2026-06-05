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

export type ArchitectureAgentStage =
  | 'ARCHITECTURE_GENERATION_STARTED'
  | 'LAYER_DESIGN'
  | 'MODULE_DESIGN'
  | 'DEPENDENCY_ANALYSIS'
  | 'ARCHITECTURE_VALIDATION'
  | 'BLUEPRINT_GENERATED'
  | 'BLUEPRINT_RETURNED';

export interface IArchitectureAgentLog {
  readonly stage: ArchitectureAgentStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface ILayerDefinition {
  readonly name: string;
  readonly responsibility: string;
  readonly allowedDependencies: readonly string[];
}

export interface IModuleDefinition {
  readonly name: string;
  readonly layer: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
}

export interface IDependencyGraph {
  readonly nodes: readonly { id: string; name: string; layer: string }[];
  readonly edges: readonly { from: string; to: string }[];
  readonly hasCircularDependencies: boolean;
}

export interface IArchitectureBlueprint {
  readonly requestId: string;
  readonly sessionId: string;
  readonly selectedArchitecturePattern: string;
  readonly layerDiagram: readonly ILayerDefinition[];
  readonly moduleDiagram: readonly IModuleDefinition[];
  readonly packageLayout: readonly string[];
  readonly folderLayout: Record<string, any>;
  readonly dependencyGraph: IDependencyGraph;
  readonly communicationRules: readonly string[];
  readonly sharedLibraries: readonly string[];
  readonly designPrinciples: readonly string[];
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly validationErrors?: readonly string[];
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}


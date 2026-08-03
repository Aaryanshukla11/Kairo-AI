export type DependencyType =
  | 'File'
  | 'Module'
  | 'Symbol'
  | 'Import'
  | 'API'
  | 'Database'
  | 'Configuration'
  | 'Package'
  | 'Environment'
  | 'Runtime'
  | 'Build'
  | 'Testing';

export type DependencyDirection = 'Incoming' | 'Outgoing' | 'Bidirectional';

export type DependencyStrength = 'Direct' | 'Transitive' | 'Peer' | 'Optional';

export type DependencyRisk = 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface DependencyNode {
  id: string;
  name: string;
  type: DependencyType;
  metadata?: Record<string, any>;
}

export interface DependencyEdge {
  id: string; // Dependency ID
  source: string;
  target: string;
  type: DependencyType;
  direction: DependencyDirection;
  strength: DependencyStrength;
  required: boolean;
  optional: boolean;
  risk: DependencyRisk;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface DependencyGraph {
  nodes: Record<string, DependencyNode>;
  edges: Record<string, DependencyEdge>;
  adjacencyList: Record<string, string[]>;
}

export interface CircularDependencyReport {
  hasCycles: boolean;
  cycles: string[][];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'Redundant' | 'Unused' | 'Duplicate' | 'MergeOpportunity';
  description: string;
  targetNodes: string[];
  severity: 'Info' | 'Warning' | 'High';
}

export interface DependencyResolutionReport {
  reportId: string;
  timestamp: number;
  graph: DependencyGraph;
  executionOrder: string[];
  circularReport: CircularDependencyReport;
  confidence: number;
  suggestions: OptimizationSuggestion[];
  metrics: {
    nodeCount: number;
    edgeCount: number;
    resolutionTimeMs: number;
    criticalPathLength: number;
  };
}

export interface DependencyResolutionInput {
  featurePlan?: any;
  taskGraph?: any;
  workspaceIndex?: any;
  symbolGraph?: any;
  importGraph?: any;
  architectureGraph?: any;
  projectConventions?: any;
}

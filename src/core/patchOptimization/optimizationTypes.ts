export interface OptimizedPatchReport {
  patchId: string;
  originalPatchSize: number;
  optimizedPatchSize: number;
  optimizationRatio: number;
  mergedOperations: string[];
  removedOperations: string[];
  predictedMergeRisk: 'low' | 'medium' | 'high';
  diagnostics: string[];
  confidence: number;
}

export enum OptimizationEventType {
  OptimizationStarted = 'OptimizationStarted',
  PatchAnalyzed = 'PatchAnalyzed',
  OperationsMerged = 'OperationsMerged',
  PatchReduced = 'PatchReduced',
  OptimizationValidated = 'OptimizationValidated',
  OptimizationCompleted = 'OptimizationCompleted'
}

export interface OptimizationEvent {
  type: OptimizationEventType;
  timestamp: number;
  payload?: any;
}

export type OptimizationEventListener = (event: OptimizationEvent) => void;

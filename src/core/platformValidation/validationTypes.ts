export interface ValidationContext {
  timestamp: number;
  options?: Record<string, any>;
}

export interface ValidationResult {
  name: string;
  status: 'Passed' | 'Failed' | 'Warning';
  score: number; // 0 to 100
  details?: string;
  errors?: string[];
  warnings?: string[];
  metrics?: Record<string, number>;
}

export interface IValidationProvider {
  readonly id: string;
  readonly name: string;
  readonly targetSubsystem: string;
  validate(context: ValidationContext): Promise<ValidationResult>;
}

export interface PlatformHealthReport {
  timestamp: number;
  overallScore: number;
  subsystems: Record<string, SubsystemHealth>;
  trend: 'Improving' | 'Stable' | 'Declining';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  criticalFailures: string[];
  recoveryRecommendations: string[];
}

export interface SubsystemHealth {
  score: number;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  lastValidated: number;
  metrics: Record<string, number>;
  checksCount: number;
  passedChecks: number;
  failedChecks: number;
  errors: string[];
  warnings: string[];
}

export interface DependencyNode {
  id: string;
  name: string;
  imports: string[];
  exports: string[];
  layer: string;
}

export interface DependencyGraphData {
  nodes: DependencyNode[];
  circularPaths: string[][];
  unusedModules: string[];
  duplicateProviders: string[];
  missingImports: string[];
  missingExports: string[];
  invalidReferences: string[];
  orphanModules: string[];
}

export interface ModuleBoundaryReport {
  violations: string[];
  layerLeaks: string[];
  featureCouplingIssues: string[];
  runtimeCyclesDetected: string[];
  duplicateServices: string[];
}

export interface PlatformValidationReport {
  id: string;
  timestamp: number;
  overallHealthScore: number;
  scores: {
    architecture: number;
    integration: number;
    dependencyGraph: number;
    moduleHealth: number;
    providerHealth: number;
    registryHealth: number;
    pipelineHealth: number;
  };
  results: Record<string, ValidationResult>;
  dependencyGraph: DependencyGraphData;
  boundaryReport: ModuleBoundaryReport;
  pipelineStatus: 'Success' | 'Failed' | 'Warning';
  pipelineSteps: PipelineStepResult[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface PipelineStepResult {
  stage: string;
  status: 'Success' | 'Failed' | 'Warning';
  durationMs: number;
  outputPassed: boolean;
  metrics: Record<string, number>;
  error?: string;
  warning?: string;
}

export interface IntegrationHistoryEntry {
  timestamp: number;
  reportId: string;
  overallScore: number;
  pipelineStatus: 'Success' | 'Failed' | 'Warning';
  failedSteps: string[];
}

export enum PlatformValidationEventType {
  ValidationStarted = 'platform_validation:started',
  ValidationCompleted = 'platform_validation:completed',
  StepStarted = 'platform_validation:step_started',
  StepCompleted = 'platform_validation:step_completed',
  HealthUpdated = 'platform_validation:health_updated',
  AlertTriggered = 'platform_validation:alert_triggered'
}

export interface PlatformValidationEvent {
  type: PlatformValidationEventType;
  timestamp: number;
  payload: any;
}

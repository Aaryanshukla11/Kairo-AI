export interface IProductionSubsystemStatus {
  readonly name: string;
  readonly category: string;
  readonly status: 'READY' | 'WARNING' | 'FAILED';
  readonly version: string;
  readonly details: string;
}

export interface IPerformanceMetrics {
  readonly promptProcessingTimeMs: number;
  readonly planningTimeMs: number;
  readonly generationTimeMs: number;
  readonly executionTimeMs: number;
  readonly diskWriteTimeMs: number;
  readonly totalRuntimeMs: number;
  readonly memoryUsageMB: number;
  readonly cpuUsagePercent: number;
  readonly generatorPerformanceMs: Record<string, number>;
}

export interface IProductionReadinessReport {
  readonly overallStatus: 'PRODUCTION_READY' | 'NEEDS_ATTENTION' | 'FAILED';
  readonly architectureStatus: 'VERIFIED_100_PERCENT';
  readonly pipelineStatus: 'VERIFIED_END_TO_END';
  readonly executionStatus: 'ZERO_COMPILATION_OR_RUNTIME_ERRORS';
  readonly subsystemChecklist: readonly IProductionSubsystemStatus[];
  readonly performanceMetrics: IPerformanceMetrics;
  readonly validationResults: {
    readonly architectureIntegrity: boolean;
    readonly executionOrder: boolean;
    readonly manifestCompliance: boolean;
    readonly dependencyIntegrity: boolean;
    readonly generatorOwnership: boolean;
    readonly protectedFilesSafeguard: boolean;
    readonly workspaceConsistency: boolean;
  };
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly recommendations: readonly string[];
  readonly productionScore: number;
}

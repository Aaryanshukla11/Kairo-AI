export interface RuntimeValidationContext {
  timestamp: number;
  options?: Record<string, any>;
}

export interface RuntimeValidationResult {
  name: string;
  status: 'Passed' | 'Failed' | 'Warning';
  score: number;
  details?: string;
  errors?: string[];
  warnings?: string[];
  metrics?: Record<string, number>;
}

export interface IRuntimeValidationProvider {
  readonly id: string;
  readonly name: string;
  readonly targetSubsystem: string;
  validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult>;
}

export interface SubsystemTelemetry {
  subsystem: string;
  timestamp: number;
  cpuUsage: number;
  ramUsageBytes: number;
  gpuUsage?: number;
  vramUsageBytes?: number;
  latencyMs?: number;
  errorsCount: number;
  warningsCount: number;
  activeRequests: number;
}

export interface RuntimeHealthStatus {
  overallScore: number;
  subsystemHealth: Record<string, {
    score: number;
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    metrics: Record<string, number>;
  }>;
  performanceTrends: 'Improving' | 'Stable' | 'Declining';
  reliabilityTrends: 'High' | 'Moderate' | 'Degraded';
  securityRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  memoryStability: 'Stable' | 'Leak Warning' | 'Critical Leak';
  recommendations: string[];
}

export interface InferenceReplaySession {
  sessionId: string;
  timestamp: number;
  prompt: string;
  context: string;
  tokenizerVersion: string;
  modelVersion: string;
  configuration: Record<string, any>;
  timingMs: {
    total: number;
    promptAssembly: number;
    tokenization: number;
    inferenceExecution: number;
    detokenization: number;
  };
  memoryUsageBytes: {
    start: number;
    peak: number;
    end: number;
  };
  runtimeEvents: string[];
  inferenceOutput: string;
}

export interface ProfilerTelemetry {
  startupTimeMs: number;
  shutdownTimeMs: number;
  modelLoadingTimeMs: number;
  contextAssemblyMs: number;
  promptCompilationMs: number;
  inferenceLatencyMs: number;
  tokensPerSec: number;
  cpuUtilPct: number;
  ramUtilPct: number;
  gpuUtilPct: number;
  vramUtilPct: number;
  diskReadWriteBps: number;
  checkpointLoadingMs: number;
  artifactLoadingMs: number;
}

export interface SecurityAuditResult {
  workspaceIsolated: boolean;
  pluginIsolated: boolean;
  safeEditIntegrated: boolean;
  filesystemProtected: boolean;
  artifactIntegrityPassed: boolean;
  checksumValidated: boolean;
  permissionsValidated: boolean;
  sandboxEnforced: boolean;
  commandsValidated: boolean;
  violations: string[];
}

export interface ReliabilityTestResult {
  crashRecoveryRate: number;
  gracefulShutdownPassed: boolean;
  checkpointRecoveryPassed: boolean;
  interruptedInferenceRecovered: boolean;
  corruptedArtifactHandled: boolean;
  memoryRecoveryPct: number;
  pluginRecoveryPassed: boolean;
  watchdogTriggers: number;
  failures: string[];
}

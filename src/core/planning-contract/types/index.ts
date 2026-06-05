export type TaskType =
  | 'CREATE_STRUCTURE'
  | 'GENERATE_FRONTEND'
  | 'GENERATE_BACKEND'
  | 'GENERATE_DATABASE'
  | 'GENERATE_API'
  | 'GENERATE_AUTH'
  | 'GENERATE_CONFIGURATION'
  | 'GENERATE_DOCUMENTATION'
  | 'GENERATE_TESTS'
  | 'EXECUTE_PROJECT'
  | 'VALIDATE_PROJECT';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IPlanningTask {
  readonly taskId: string;
  readonly taskName: string;
  readonly taskType: TaskType;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly dependencies: readonly string[];
  readonly input: string;
  readonly expectedOutput: string;
  readonly owner: string;
  readonly executionOrder: number;
}

export interface IExecutionPhase {
  readonly phaseId: string;
  readonly phaseName: string;
  readonly taskIds: readonly string[];
}

export interface IPlanningContract {
  readonly contractVersion: string; // e.g. "1.0.0"
  readonly requestId: string;
  readonly projectInfo: {
    readonly name: string;
    readonly type: string;
    readonly description: string;
    readonly targetPlatform: string;
    readonly language: string;
    readonly frontendFramework: string | null;
    readonly backendFramework: string | null;
    readonly database: string | null;
    readonly authentication: string | null;
    readonly deploymentTarget: string | null;
  };
  readonly detectedFeatures: readonly string[];
  readonly projectArchitecture: string;
  readonly executionPhases: readonly IExecutionPhase[];
  readonly taskGraph: readonly IPlanningTask[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly metadata: {
    readonly generatedAt: number;
    readonly planningDurationMs: number;
  };
}

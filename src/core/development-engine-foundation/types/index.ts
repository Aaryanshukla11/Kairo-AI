export type TaskProgressState =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'FAILED'
  | 'CANCELLED';

export interface IGenerator {
  readonly generatorId: string;
  readonly supportedTaskTypes: readonly string[];
  execute(task: any): Promise<{ success: boolean; error?: string }>;
}

export interface IGenerationError {
  readonly taskId: string;
  readonly generator: string;
  readonly category: string;
  readonly message: string;
  readonly severity: 'CRITICAL' | 'WARNING';
  readonly timestamp: number;
}

export interface IGenerationReport {
  readonly completedTasks: readonly string[];
  readonly skippedTasks: readonly string[];
  readonly failedTasks: readonly string[];
  readonly executionTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly IGenerationError[];
}

export interface IGenerationExecution {
  readonly executionId: string;
  readonly project: {
    readonly name: string;
    readonly type: string;
  };
  readonly taskGraph: readonly any[];
  readonly executionQueue: readonly string[]; // Task IDs in topological execution order
  readonly generators: readonly string[]; // Registered generator IDs
  readonly progress: Readonly<Record<string, TaskProgressState>>;
  readonly report: IGenerationReport;
}

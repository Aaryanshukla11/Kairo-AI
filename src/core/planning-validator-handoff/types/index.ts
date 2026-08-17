import { IPlanningContract, IPlanningTask, IExecutionPhase } from '../planning-contract/types';

export interface IValidationError {
  readonly errorId: string;
  readonly category: 'SCHEMA' | 'TASK' | 'DEPENDENCY' | 'EXECUTION' | 'SAFETY' | 'VERSION';
  readonly description: string;
  readonly severity: 'CRITICAL' | 'WARNING';
  readonly affectedTask: string | null;
  readonly suggestedResolution: string;
}

export interface IValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly IValidationError[];
  readonly warnings: readonly string[];
}

export interface IDevelopmentRequest {
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
  readonly technologyStack: {
    readonly language: string;
    readonly frontend: string | null;
    readonly backend: string | null;
    readonly database: string | null;
  };
  readonly executionPhases: readonly IExecutionPhase[];
  readonly validatedTaskGraph: readonly IPlanningTask[];
  readonly dependencies: readonly string[];
  readonly warnings: readonly string[];
  readonly metadata: {
    readonly generatedAt: number;
    readonly validatedAt: number;
    readonly schemaVersion: string;
    readonly conversationHistory?: readonly { role: 'user' | 'assistant'; text: string }[];
    readonly sourceCodeContext?: readonly { filePath: string; content: string }[];
  };
}

export interface IHandoffResult {
  readonly status: 'SUCCESS' | 'FAILED';
  readonly report: IValidationReport;
  readonly developmentRequest: IDevelopmentRequest | null;
}

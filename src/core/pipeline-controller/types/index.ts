import { IDevelopmentRequest } from '../planning-validator-handoff/types';

export type PipelineState =
  | 'IDLE'
  | 'PROCESSING_PROMPT'
  | 'PLANNING'
  | 'VALIDATING_PLAN'
  | 'PREPARING_DEVELOPMENT'
  | 'READY_FOR_GENERATION'
  | 'GENERATING_CODE'
  | 'APPLYING_CHANGES'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export type PipelineEventType =
  | 'PromptReceived'
  | 'PromptParsed'
  | 'PlanningStarted'
  | 'PlanningCompleted'
  | 'ValidationStarted'
  | 'ValidationCompleted'
  | 'DevelopmentReady'
  | 'DevelopmentRequestCreated'
  | 'GeneratorSessionCreated'
  | 'CodingRuntimeInvoked'
  | 'LLMResponseReceived'
  | 'GenerationContractCreated'
  | 'WorkspaceEngineStarted'
  | 'FilesGenerated'
  | 'ReviewChangesUpdated'
  | 'PipelineCompleted'
  | 'PipelineFailed';

export interface IPipelineEvent {
  readonly eventId: string;
  readonly eventType: PipelineEventType;
  readonly timestamp: number;
  readonly state: PipelineState;
  readonly message: string;
  readonly data?: any;
}

export interface IPipelineResult {
  readonly pipelineId: string;
  readonly state: PipelineState;
  readonly developmentRequest: IDevelopmentRequest | null;
  readonly executionTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly generationResult?: any;
  readonly workspaceReport?: any;
}

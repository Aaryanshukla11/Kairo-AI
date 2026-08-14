export type KairoEventType =
  | 'PromptReceived'
  | 'IntentDetected'
  | 'WorkspaceAnalysisStarted'
  | 'WorkspaceAnalysisCompleted'
  | 'RequirementAnalysisStarted'
  | 'RequirementAnalysisCompleted'
  | 'ArchitectureGenerationStarted'
  | 'ArchitectureGenerationCompleted'
  | 'ImplementationPlanStarted'
  | 'ImplementationPlanCompleted'
  | 'RequirementCompleted'
  | 'ArchitectureCompleted'
  | 'WorkspaceCompleted'
  | 'ManifestCompleted'
  | 'GenerationStarted'
  | 'GeneratorStarted'
  | 'GeneratorCompleted'
  | 'FileGenerationStarted'
  | 'FileGenerationCompleted'
  | 'FileWriteStarted'
  | 'FileWriteCompleted'
  | 'FileValidationStarted'
  | 'FileValidationCompleted'
  | 'ReviewUpdateStarted'
  | 'ReviewUpdateCompleted'
  | 'ExecutionStarted'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'ReviewUpdated'
  | 'ProjectCompleted';

export type EventPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IKairoEvent {
  readonly eventId: string;
  readonly eventType: KairoEventType | string;
  readonly timestamp: number;
  readonly source: string;
  readonly priority: EventPriority;
  readonly correlationId: string;
  readonly sessionId: string;
  readonly payload: Record<string, any>;
}

export interface IEventValidationResult {
  readonly valid: boolean;
  readonly errorType?: 'UNKNOWN_EVENT' | 'DUPLICATE_EVENT' | 'DEAD_EVENT' | 'CIRCULAR_EVENT' | 'INVALID_PAYLOAD';
  readonly message?: string;
}

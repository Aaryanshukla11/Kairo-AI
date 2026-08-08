export type KairoEventType =
  | 'PromptReceived'
  | 'RequirementCompleted'
  | 'ArchitectureCompleted'
  | 'WorkspaceCompleted'
  | 'ManifestCompleted'
  | 'GenerationCompleted'
  | 'ExecutionStarted'
  | 'ExecutionCompleted'
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

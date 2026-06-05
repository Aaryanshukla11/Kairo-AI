export type EventPriority = 'Critical' | 'High' | 'Normal' | 'Low' | 'Background';

export type DeliveryGuarantee = 'At Most Once' | 'At Least Once' | 'Exactly Once';

export type WorkflowState =
  | 'Created'
  | 'Queued'
  | 'Running'
  | 'Waiting'
  | 'Paused'
  | 'Retrying'
  | 'Completed'
  | 'Cancelled'
  | 'Failed'
  | 'Recovered';

export type EventCategory =
  | 'Planner'
  | 'Generation'
  | 'AST'
  | 'Validation'
  | 'Review'
  | 'Security'
  | 'Patch'
  | 'Execution'
  | 'Workspace'
  | 'Memory'
  | 'Model'
  | 'UI'
  | 'Telemetry';

export interface AIIdleEvent {
  eventId: string;
  workflowId: string;
  correlationId: string;
  parentEventId?: string;
  timestamp: number;
  publisher: string;
  subscribers: string[];
  priority: EventPriority;
  category: EventCategory;
  payload: any;
  metadata: Record<string, any>;
  retryCount: number;
  executionStatus: string;
}

export interface DeadLetterEntry {
  event: AIIdleEvent;
  failureReason: string;
  retryAttempts: number;
  workflowContext: any;
  recoveryRecommendation: string;
}

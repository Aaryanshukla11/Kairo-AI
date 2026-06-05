import { EventEmitter } from 'events';
import { WorkflowState, WorkflowCoordinatorReport } from './workflowTypes';

export enum WorkflowEventType {
  WORKFLOW_CREATED = 'workflow:created',
  WORKFLOW_QUEUED = 'workflow:queued',
  WORKFLOW_STARTED = 'workflow:started',
  STAGE_DISPATCHED = 'workflow:stage_dispatched',
  STAGE_COMPLETED = 'workflow:stage_completed',
  RETRY_TRIGGERED = 'workflow:retry_triggered',
  STATE_CHANGED = 'workflow:state_changed',
  WORKFLOW_COMPLETED = 'workflow:completed',
  WORKFLOW_FAILED = 'workflow:failed'
}

export interface WorkflowEventPayload {
  timestamp: number;
  workflowId?: string;
  stageId?: string;
  previousState?: WorkflowState;
  newState?: WorkflowState;
  report?: WorkflowCoordinatorReport;
  error?: string;
  data?: any;
}

export class WorkflowEventEmitter extends EventEmitter {
  emitEvent(type: WorkflowEventType, payload: WorkflowEventPayload): void {
    this.emit(type, payload);
  }

  onEvent(type: WorkflowEventType, listener: (payload: WorkflowEventPayload) => void): void {
    this.on(type, listener);
  }
}

export const workflowEvents = new WorkflowEventEmitter();

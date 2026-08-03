import { EventEmitter } from 'events';
import { RecoveryReport, FailureType, CheckpointModel, RecoveryState } from './recoveryTypes';

export enum RecoveryEventType {
  FAILURE_DETECTED = 'recovery:failure_detected',
  RECOVERY_STARTED = 'recovery:started',
  CHECKPOINT_RESTORED = 'recovery:checkpoint_restored',
  ROLLBACK_PERFORMED = 'recovery:rollback_performed',
  WORKFLOW_RECOVERED = 'recovery:workflow_recovered',
  RECOVERY_COMPLETED = 'recovery:completed',
  RECOVERY_FAILED = 'recovery:failed'
}

export interface RecoveryEventPayload {
  timestamp: number;
  workflowId?: string;
  failureType?: FailureType;
  checkpoint?: CheckpointModel;
  report?: RecoveryReport;
  error?: string;
}

export class RecoveryEventEmitter extends EventEmitter {
  emitEvent(type: RecoveryEventType, payload: RecoveryEventPayload): void {
    this.emit(type, payload);
  }

  onEvent(type: RecoveryEventType, listener: (payload: RecoveryEventPayload) => void): void {
    this.on(type, listener);
  }
}

export const recoveryEvents = new RecoveryEventEmitter();

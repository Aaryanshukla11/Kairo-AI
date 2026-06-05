import { EventEmitter } from 'events';
import { MilestoneState, MilestoneNode, MilestoneOrchestrationReport } from './milestoneTypes';

export enum MilestoneEventType {
  MILESTONE_STARTED = 'milestone:started',
  MILESTONE_STATE_CHANGED = 'milestone:state_changed',
  CHECKPOINT_SAVED = 'milestone:checkpoint_saved',
  RECOVERY_TRIGGERED = 'milestone:recovery_triggered',
  ORCHESTRATION_COMPLETED = 'milestone:orchestration_completed',
  ORCHESTRATION_FAILED = 'milestone:orchestration_failed'
}

export interface MilestoneEventPayload {
  timestamp: number;
  milestoneId?: string;
  previousState?: MilestoneState;
  newState?: MilestoneState;
  report?: MilestoneOrchestrationReport;
  error?: string;
  data?: any;
}

export class MilestoneEventEmitter extends EventEmitter {
  emitEvent(type: MilestoneEventType, payload: MilestoneEventPayload): void {
    this.emit(type, payload);
  }

  onEvent(type: MilestoneEventType, listener: (payload: MilestoneEventPayload) => void): void {
    this.on(type, listener);
  }
}

export const milestoneEvents = new MilestoneEventEmitter();

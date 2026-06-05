import { EventEmitter } from 'events';
import { ReplanningReport, ReplanTrigger, ImpactAnalysisResult } from './replanningTypes';

export enum ReplanningEventType {
  REPLANNING_STARTED = 'replanning:started',
  CHANGE_DETECTED = 'replanning:change_detected',
  IMPACT_ANALYZED = 'replanning:impact_analyzed',
  WORKFLOW_UPDATED = 'replanning:workflow_updated',
  CONFLICT_RESOLVED = 'replanning:conflict_resolved',
  REPLANNING_COMPLETED = 'replanning:completed',
  REPLANNING_FAILED = 'replanning:failed'
}

export interface ReplanningEventPayload {
  timestamp: number;
  workflowId?: string;
  trigger?: ReplanTrigger;
  impact?: ImpactAnalysisResult;
  report?: ReplanningReport;
  error?: string;
}

export class ReplanningEventEmitter extends EventEmitter {
  emitEvent(type: ReplanningEventType, payload: ReplanningEventPayload): void {
    this.emit(type, payload);
  }

  onEvent(type: ReplanningEventType, listener: (payload: ReplanningEventPayload) => void): void {
    this.on(type, listener);
  }
}

export const replanningEvents = new ReplanningEventEmitter();

import { ReplanTrigger, ReplanTriggerType } from './replanningTypes';
import { replanningEvents, ReplanningEventType } from './replanningEvents';

export class ChangeDetector {
  detectChange(input?: any): ReplanTrigger {
    const triggerType = input?.triggerType || ReplanTriggerType.TaskFailure;
    const sourceId = input?.failedSourceId || 'stg-03';

    const trigger: ReplanTrigger = {
      id: `trig-${Date.now()}`,
      type: triggerType,
      sourceId,
      reason: input?.reason || `Unexpected state change in stage/task ${sourceId}`,
      timestamp: Date.now()
    };

    replanningEvents.emitEvent(ReplanningEventType.CHANGE_DETECTED, {
      timestamp: trigger.timestamp,
      workflowId: input?.workflowId,
      trigger
    });

    return trigger;
  }
}

export const changeDetector = new ChangeDetector();

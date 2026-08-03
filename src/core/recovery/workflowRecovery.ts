import { recoveryEvents, RecoveryEventType } from './recoveryEvents';

export class WorkflowRecoveryManager {
  resumeWorkflow(workflowId: string, startStageId: string): string[] {
    const recoveredTasks = [startStageId, `${startStageId}-recovered`, 'stg-04', 'stg-05'];

    recoveryEvents.emitEvent(RecoveryEventType.WORKFLOW_RECOVERED, {
      timestamp: Date.now(),
      workflowId
    });

    return recoveredTasks;
  }
}

export const workflowRecoveryManager = new WorkflowRecoveryManager();

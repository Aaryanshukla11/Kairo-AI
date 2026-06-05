import { WorkflowState } from './workflowTypes';
import { workflowEvents, WorkflowEventType } from './workflowEvents';

export class WorkflowLifecycleManager {
  private allowedTransitions: Record<WorkflowState, WorkflowState[]> = {
    [WorkflowState.Created]: [WorkflowState.Queued, WorkflowState.Cancelled],
    [WorkflowState.Queued]: [WorkflowState.Scheduled, WorkflowState.Cancelled],
    [WorkflowState.Scheduled]: [WorkflowState.Running, WorkflowState.Cancelled],
    [WorkflowState.Running]: [WorkflowState.Waiting, WorkflowState.Paused, WorkflowState.Retrying, WorkflowState.Recovering, WorkflowState.Completed, WorkflowState.Failed, WorkflowState.Cancelled],
    [WorkflowState.Waiting]: [WorkflowState.Running, WorkflowState.Cancelled],
    [WorkflowState.Paused]: [WorkflowState.Running, WorkflowState.Cancelled],
    [WorkflowState.Retrying]: [WorkflowState.Running, WorkflowState.Failed, WorkflowState.Cancelled],
    [WorkflowState.Recovering]: [WorkflowState.Running, WorkflowState.Failed, WorkflowState.Completed],
    [WorkflowState.Completed]: [],
    [WorkflowState.Cancelled]: [],
    [WorkflowState.Failed]: [WorkflowState.Recovering]
  };

  canTransition(from: WorkflowState, to: WorkflowState): boolean {
    const allowed = this.allowedTransitions[from] || [];
    return allowed.includes(to);
  }

  transition(workflowId: string, from: WorkflowState, to: WorkflowState): WorkflowState {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid workflow transition from ${from} to ${to} for workflow ${workflowId}`);
    }

    workflowEvents.emitEvent(WorkflowEventType.STATE_CHANGED, {
      timestamp: Date.now(),
      workflowId,
      previousState: from,
      newState: to
    });

    return to;
  }
}

export const workflowLifecycleManager = new WorkflowLifecycleManager();

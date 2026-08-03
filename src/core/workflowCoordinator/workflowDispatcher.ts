import { WorkflowStage, WorkflowState } from './workflowTypes';
import { workflowEvents, WorkflowEventType } from './workflowEvents';

export class WorkflowDispatcher {
  dispatchStage(workflowId: string, stage: WorkflowStage): void {
    stage.status = WorkflowState.Running;
    workflowEvents.emitEvent(WorkflowEventType.STAGE_DISPATCHED, {
      timestamp: Date.now(),
      workflowId,
      stageId: stage.id,
      newState: WorkflowState.Running
    });
  }

  completeStage(workflowId: string, stage: WorkflowStage): void {
    stage.status = WorkflowState.Completed;
    workflowEvents.emitEvent(WorkflowEventType.STAGE_COMPLETED, {
      timestamp: Date.now(),
      workflowId,
      stageId: stage.id,
      newState: WorkflowState.Completed
    });
  }
}

export const workflowDispatcher = new WorkflowDispatcher();

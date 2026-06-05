import { WorkflowState } from './eventTypes';

export class WorkflowStateTracker {
  private activeStates = new Map<string, WorkflowState>();

  public update(workflowId: string, state: WorkflowState): void {
    this.activeStates.set(workflowId, state);
  }

  public get(workflowId: string): WorkflowState | undefined {
    return this.activeStates.get(workflowId);
  }
}
export const workflowStateTracker = new WorkflowStateTracker();

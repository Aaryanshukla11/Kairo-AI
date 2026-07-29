import { eventBusInstance } from './eventBus';
import { workflowStateTracker } from './workflowState';
import { AIIdleEvent } from './eventTypes';

export class WorkflowOrchestrator {
  public async startWorkflow(workflowId: string, initialPayload: any): Promise<void> {
    workflowStateTracker.update(workflowId, 'Created');
    
    // Publish initial Planner event
    const event: AIIdleEvent = {
      eventId: `EV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      workflowId,
      correlationId: `corr-${workflowId}`,
      timestamp: Date.now(),
      publisher: 'WorkflowOrchestrator',
      subscribers: [],
      priority: 'Normal',
      category: 'Planner',
      payload: initialPayload,
      metadata: {},
      retryCount: 0,
      executionStatus: 'Queued'
    };

    workflowStateTracker.update(workflowId, 'Running');
    await eventBusInstance.publish(event);
  }
}
export const workflowOrchestrator = new WorkflowOrchestrator();

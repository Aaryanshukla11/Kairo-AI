import { WorkflowGraph, WorkflowStage, WorkflowStrategyType } from '../workflowTypes';

export class ApprovalWorkflowStrategy {
  apply(stages: WorkflowStage[], executionOrder: string[]): WorkflowGraph {
    return {
      id: `wf-app-${Date.now()}`,
      name: 'Approval Workflow Execution Strategy',
      strategy: WorkflowStrategyType.Approval,
      stages,
      executionOrder,
      parallelGroups: executionOrder.map(id => [id]),
      criticalPath: executionOrder
    };
  }
}

import { WorkflowGraph, WorkflowStage, WorkflowStrategyType } from '../workflowTypes';

export class RecoveryWorkflowStrategy {
  apply(stages: WorkflowStage[], executionOrder: string[]): WorkflowGraph {
    return {
      id: `wf-rec-${Date.now()}`,
      name: 'Recovery Workflow Execution Strategy',
      strategy: WorkflowStrategyType.Recovery,
      stages,
      executionOrder,
      parallelGroups: executionOrder.map(id => [id]),
      criticalPath: executionOrder
    };
  }
}

import { WorkflowGraph, WorkflowStage, WorkflowStrategyType } from '../workflowTypes';

export class ConditionalWorkflowStrategy {
  apply(stages: WorkflowStage[], executionOrder: string[]): WorkflowGraph {
    return {
      id: `wf-cond-${Date.now()}`,
      name: 'Conditional Workflow Execution Strategy',
      strategy: WorkflowStrategyType.Conditional,
      stages,
      executionOrder,
      parallelGroups: executionOrder.map(id => [id]),
      criticalPath: executionOrder
    };
  }
}

import { WorkflowGraph, WorkflowStage, WorkflowStrategyType, WorkflowState } from '../workflowTypes';

export class SequentialWorkflowStrategy {
  apply(stages: WorkflowStage[], executionOrder: string[]): WorkflowGraph {
    return {
      id: `wf-seq-${Date.now()}`,
      name: 'Sequential Workflow Execution Strategy',
      strategy: WorkflowStrategyType.Sequential,
      stages,
      executionOrder,
      parallelGroups: executionOrder.map(id => [id]),
      criticalPath: executionOrder
    };
  }
}

import { WorkflowGraph, WorkflowStage, WorkflowStrategyType } from '../workflowTypes';
import { workflowScheduler } from '../workflowScheduler';

export class ParallelWorkflowStrategy {
  apply(stages: WorkflowStage[], executionOrder: string[]): WorkflowGraph {
    const parallelGroups = workflowScheduler.scheduleParallelGroups(stages, executionOrder);
    return {
      id: `wf-par-${Date.now()}`,
      name: 'Parallel Workflow Execution Strategy',
      strategy: WorkflowStrategyType.Parallel,
      stages,
      executionOrder,
      parallelGroups,
      criticalPath: executionOrder
    };
  }
}

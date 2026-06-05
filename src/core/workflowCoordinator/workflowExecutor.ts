import { WorkflowGraph, WorkflowStage, WorkflowState, WorkflowRetryItem } from './workflowTypes';
import { workflowDispatcher } from './workflowDispatcher';
import { workflowRetryManager } from './workflowRetryManager';

export class WorkflowExecutor {
  async execute(graph: WorkflowGraph): Promise<{ timeline: { stageId: string; state: WorkflowState; durationMs: number }[]; retries: WorkflowRetryItem[] }> {
    const timeline: { stageId: string; state: WorkflowState; durationMs: number }[] = [];
    const retries: WorkflowRetryItem[] = [];

    for (const stageId of graph.executionOrder) {
      const stage = graph.stages.find(s => s.id === stageId);
      if (!stage) continue;

      const startTime = Date.now();
      workflowDispatcher.dispatchStage(graph.id, stage);

      // Simulate step dispatch without actual file edit or code gen
      workflowDispatcher.completeStage(graph.id, stage);

      timeline.push({
        stageId,
        state: WorkflowState.Completed,
        durationMs: Date.now() - startTime
      });
    }

    return { timeline, retries };
  }
}

export const workflowExecutor = new WorkflowExecutor();

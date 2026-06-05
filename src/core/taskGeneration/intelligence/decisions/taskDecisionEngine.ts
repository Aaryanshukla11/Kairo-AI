import { TaskDecision, TaskDecisionAction } from './decisionTypes';
import { TaskModel } from '../../taskTypes';

export class TaskDecisionEngine {
  public evaluateDecisions(tasks: TaskModel[]): Record<string, TaskDecision> {
    const decisions: Record<string, TaskDecision> = {};

    for (const task of tasks) {
      let action: TaskDecisionAction = 'Parallelize';
      let reason = 'Task fits parallel execution worker pool.';

      if (task.risk === 'Critical') {
        action = 'Escalate';
        reason = 'Critical risk level requires explicit user administrator escalation.';
      } else if (task.dependencies.length > 2) {
        action = 'Delay';
        reason = 'Multiple preceding dependencies delay task start slot.';
      } else if (task.taskType === 'Testing Task') {
        action = 'Merge';
        reason = 'Testing task can be merged into adjacent verification step.';
      }

      decisions[task.taskId] = {
        taskId: task.taskId,
        action,
        reason,
        confidence: 0.94
      };
    }

    return decisions;
  }
}
export const taskDecisionEngine = new TaskDecisionEngine();

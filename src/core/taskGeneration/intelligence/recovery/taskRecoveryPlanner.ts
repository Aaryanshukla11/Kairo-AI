import { TaskRecoveryPlan } from './recoveryTypes';
import { TaskModel } from '../../taskTypes';

export class TaskRecoveryPlanner {
  public planRecovery(tasks: TaskModel[]): Record<string, TaskRecoveryPlan> {
    const map: Record<string, TaskRecoveryPlan> = {};

    for (const task of tasks) {
      map[task.taskId] = {
        taskId: task.taskId,
        retryStrategy: task.risk === 'High' ? 'No Retry' : 'Exponential Backoff',
        rollbackStrategy: task.taskType === 'Database Task' ? 'Snapshot Revert' : 'Git Stash Pop',
        failureRecovery: `Re-evaluate preconditions and run diagnostic checks for ${task.title}`,
        compensationSteps: [
          'Log failure diagnostics to audit trail',
          'Restore pre-task workspace snapshot checkpoint',
          'Notify workflow orchestrator of step fallback'
        ],
        recoveryConfidence: 0.92
      };
    }

    return map;
  }
}
export const taskRecoveryPlanner = new TaskRecoveryPlanner();

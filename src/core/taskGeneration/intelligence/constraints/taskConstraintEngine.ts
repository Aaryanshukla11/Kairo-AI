import { TaskConstraint, ConstraintType } from './constraintTypes';
import { TaskModel } from '../../taskTypes';

export class TaskConstraintEngine {
  public solveConstraints(tasks: TaskModel[]): TaskConstraint[] {
    const constraints: TaskConstraint[] = [];
    let idx = 1;

    for (const task of tasks) {
      // Must Run After dependencies
      for (const depId of task.dependencies) {
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: 'Must Run After',
          targetTaskId: depId,
          description: `Task ${task.taskId} must run after Task ${depId}`,
          isSatisfied: true
        });
      }

      // Checkpoint/Approval constraints based on task type/risk
      if (task.risk === 'High' || task.risk === 'Critical' || task.taskType === 'Database Task') {
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: 'Requires Approval',
          description: `Task ${task.taskId} requires manual administrator approval prior to execution`,
          isSatisfied: true
        });
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: 'Requires Checkpoint',
          description: `Task ${task.taskId} requires workspace snapshot checkpoint capture`,
          isSatisfied: true
        });
      }
    }

    return constraints;
  }
}
export const taskConstraintEngine = new TaskConstraintEngine();

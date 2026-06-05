import { ExecutionPlan } from '../planner/plannerTypes';

export class ReviewValidator {
  /**
   * Asserts plan format, checking for missing dependency IDs.
   */
  public validatePlan(plan: ExecutionPlan): void {
    if (!plan || !plan.id) {
      throw new Error('Reviewer validation error: Plan is missing or malformed');
    }

    if (!plan.tasks || !Array.isArray(plan.tasks)) {
      throw new Error('Reviewer validation error: Plan contains no execution tasks array');
    }

    const taskIds = new Set(plan.tasks.map(t => t.id));
    for (const task of plan.tasks) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          throw new Error(`Reviewer validation error: Task "${task.id}" references missing dependency task ID "${dep}"`);
        }
      }
    }
  }
}

export const reviewValidator = new ReviewValidator();

import { ExecutionPlan } from './plannerTypes';

export class PlannerValidator {
  /**
   * Rejects empty requests and impossible tasks.
   */
  public validateRequest(requestText: string): void {
    if (!requestText || !requestText.trim()) {
      throw new Error('Planner validation error: Request cannot be empty');
    }

    const impossibleKeywords = ['coffee', 'sandwich', 'fly to mars', 'world peace'];
    for (const kw of impossibleKeywords) {
      if (requestText.toLowerCase().includes(kw)) {
        throw new Error(`Planner validation error: Impossible request detected containing keyword: "${kw}"`);
      }
    }
  }

  /**
   * Inspects plans for formatting, requirements, and circular dependencies.
   */
  public validatePlan(plan: ExecutionPlan): void {
    const errors: string[] = [];

    if (!plan.goal || !plan.goal.trim()) {
      errors.push('Goal description is required');
    }

    if (plan.tasks.length === 0) {
      errors.push('Execution plan must contain at least one task item');
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (recStack.has(taskId)) return true;
      if (visited.has(taskId)) return false;

      visited.add(taskId);
      recStack.add(taskId);

      const task = plan.tasks.find(t => t.id === taskId);
      if (task) {
        for (const dep of task.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      recStack.delete(taskId);
      return false;
    };

    for (const task of plan.tasks) {
      if (hasCycle(task.id)) {
        errors.push('Circular dependencies detected in execution tasks graph');
        break;
      }
    }

    plan.validationSummary = {
      valid: errors.length === 0,
      errors
    };

    if (errors.length > 0) {
      throw new Error(`Planner validation error: Invalid plan compiled: ${errors.join(', ')}`);
    }
  }
}

export const plannerValidator = new PlannerValidator();

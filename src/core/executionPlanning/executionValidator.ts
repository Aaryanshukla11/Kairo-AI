import { ExecutionPlan } from './executionTypes';

export class ExecutionValidator {
  public validatePlan(plan: ExecutionPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plan.schedule || plan.schedule.steps.length === 0) {
      errors.push('Execution plan schedule is empty. No steps found.');
      return { valid: false, errors };
    }

    // 1. Check circular step dependencies (DFS 3-color)
    const stepIds = plan.schedule.steps.map(s => s.stepId);
    const visited: Record<string, number> = {};
    for (const id of stepIds) visited[id] = 0;

    let hasCycle = false;

    const dfs = (id: string, path: string[]) => {
      visited[id] = 1;
      const step = plan.schedule.steps.find(s => s.stepId === id);
      if (step) {
        for (const depId of step.dependencies) {
          if (visited[depId] === 1) {
            hasCycle = true;
            errors.push(`Circular execution step dependency detected: ${[...path, id, depId].join(' -> ')}`);
          } else if (visited[depId] === 0) {
            dfs(depId, [...path, id]);
          }
        }
      }
      visited[id] = 2;
    };

    for (const id of stepIds) {
      if (visited[id] === 0) {
        dfs(id, []);
      }
    }

    // 2. Validate Checkpoint presence
    if (!plan.checkpointPlan || plan.checkpointPlan.length === 0) {
      errors.push('Warning: No checkpoints planned for execution.');
    }

    // 3. Validate Rollback Boundaries presence
    if (!plan.rollbackBoundaries || plan.rollbackBoundaries.length === 0) {
      errors.push('Warning: No rollback boundaries established.');
    }

    // 4. Validate Resource Limits
    if (plan.resourcePlan.memoryLimitMB <= 0) {
      errors.push('Resource Plan memory limit must be greater than 0.');
    }

    return {
      valid: errors.length === 0 && !hasCycle,
      errors
    };
  }
}
export const executionValidator = new ExecutionValidator();

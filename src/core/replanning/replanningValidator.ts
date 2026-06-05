export interface ReplanningValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ReplanningValidator {
  validate(preservedTaskIds: string[], updatedExecutionOrder: string[]): ReplanningValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Verify preservation rules (Never discard completed work)
    for (const id of preservedTaskIds) {
      if (!updatedExecutionOrder.includes(id)) {
        errors.push(`Preserved completed task/stage ${id} was missing from the updated execution graph!`);
      }
    }

    // 2. Check duplicate tasks
    const seen = new Set<string>();
    for (const id of updatedExecutionOrder) {
      if (seen.has(id)) {
        errors.push(`Duplicate task/stage detected in replanned graph: ${id}`);
      }
      seen.add(id);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const replanningValidator = new ReplanningValidator();

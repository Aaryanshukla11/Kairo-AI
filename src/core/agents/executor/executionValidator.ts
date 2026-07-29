export class ExecutionValidator {
  /**
   * Rejects unapproved plans or plans with structural errors.
   */
  public validateApproval(plan: any): void {
    if (!plan) {
      throw new Error('Executor validation error: Execution plan cannot be null');
    }
    if (plan.validationSummary && !plan.validationSummary.valid) {
      throw new Error('Executor validation error: Cannot execute plan with validation errors');
    }
    if (plan.approved === false) {
      throw new Error('Executor validation error: Plan has not been approved for execution');
    }
  }
}

export const executionValidator = new ExecutionValidator();

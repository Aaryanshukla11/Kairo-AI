import { Plan } from './Plan';

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
}

export class PlanValidator {
  public static validate(plan: Plan): PlanValidationResult {
    const errors: string[] = [];

    if (!plan) {
      return { valid: false, errors: ['Plan cannot be null.'] };
    }

    if (!plan.id) errors.push('Plan must have an ID.');
    if (!plan.sessionId) errors.push('Plan must have a Session ID.');
    if (!plan.promptId) errors.push('Plan must have a Prompt ID.');
    if (!plan.status) errors.push('Plan must have a status.');
    
    // Additional domain validations can be added here
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

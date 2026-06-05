import { ValidationIssue } from './validationRules';

export class ValidationScorer {
  public calculateScore(issues: ValidationIssue[]): number {
    const hasBlocking = issues.some(i => i.isBlocking);
    if (hasBlocking) {
      return 0;
    }
    const deductions = issues.length * 15;
    return Math.max(0, 100 - deductions);
  }
}

export const validationScorer = new ValidationScorer();

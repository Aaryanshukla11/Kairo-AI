export interface ValidationIssue {
  ruleId: string;
  message: string;
  isBlocking: boolean;
  category: 'Syntax' | 'Semantic' | 'Architecture' | 'Dependency' | 'Policy' | 'Security';
}

export class ValidationRules {
  public execute(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (content.includes('eval(')) {
      issues.push({
        ruleId: 'VAL-001',
        message: 'Security violation: eval call detected.',
        isBlocking: true,
        category: 'Security'
      });
    }

    if (content.includes('debugger')) {
      issues.push({
        ruleId: 'VAL-002',
        message: 'Policy check failure: debugger statement present.',
        isBlocking: false,
        category: 'Policy'
      });
    }

    return issues;
  }
}

export const validationRules = new ValidationRules();

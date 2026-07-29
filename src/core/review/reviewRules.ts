import { ReviewIssue } from './reviewTypes';

export class ReviewRules {
  public execute(content: string): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    if (content.includes('TODO') || content.includes('todo')) {
      issues.push({
        ruleId: 'REV-001',
        message: 'Avoid check-in of TODO placeholders in generated code.',
        severity: 'Suggestion',
        category: 'Readability'
      });
    }

    if (content.length > 5000) {
      issues.push({
        ruleId: 'REV-002',
        message: 'File length exceeds maintainability boundaries (5000 chars).',
        severity: 'Warning',
        category: 'Maintainability'
      });
    }

    if (content.includes('any')) {
      issues.push({
        ruleId: 'REV-003',
        message: 'Detected broad type "any" usage. Favor precise types.',
        severity: 'Suggestion',
        category: 'Correctness'
      });
    }

    return issues;
  }
}

export const reviewRules = new ReviewRules();

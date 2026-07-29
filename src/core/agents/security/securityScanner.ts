import { SecurityIssue } from './securityTypes';
import { securityRules } from './securityRules';

export class SecurityScanner {
  public scanPlan(plan: any): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const tasks = plan.tasks || [];

    for (const task of tasks) {
      const taskIssues = securityRules.evaluate(task);
      issues.push(...taskIssues);
    }

    return issues;
  }
}

export const securityScanner = new SecurityScanner();

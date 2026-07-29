import { ReviewIssue } from './reviewTypes';

export class IssueCollector {
  public collectIssues(issuesList: ReviewIssue[]): { warnings: string[]; failedChecks: string[] } {
    const warnings: string[] = [];
    const failedChecks: string[] = [];

    for (const issue of issuesList) {
      if (issue.severity === 'Warning' || issue.severity === 'Critical') {
        warnings.push(issue.message);
      } else if (issue.severity === 'Error') {
        failedChecks.push(issue.message);
      }
    }

    return { warnings, failedChecks };
  }
}

export const issueCollector = new IssueCollector();

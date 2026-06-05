import { ValidationIssue } from './validationRules';

export class DiagnosticsCollector {
  public collect(issues: ValidationIssue[]): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];

    for (const issue of issues) {
      if (issue.isBlocking) {
        blocking.push(issue.message);
      } else {
        warnings.push(issue.message);
      }
    }

    return { blocking, warnings };
  }
}

export const diagnosticsCollector = new DiagnosticsCollector();

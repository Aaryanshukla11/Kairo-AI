import { ValidationReport } from './validationTypes';

export class ValidationReporter {
  public compileReport(
    id: string,
    score: number,
    passed: string[],
    failed: string[],
    blocking: string[],
    warnings: string[]
  ): ValidationReport {
    let overallStatus: 'Passed' | 'Passed With Warnings' | 'Needs Review' | 'Rejected' | 'Blocked' = 'Passed';
    if (blocking.length > 0) {
      overallStatus = 'Rejected';
    } else if (warnings.length > 0) {
      overallStatus = 'Passed With Warnings';
    }

    return {
      validationId: id,
      overallStatus,
      passedRules: passed,
      failedRules: failed,
      diagnostics: [...blocking, ...warnings],
      blockingIssues: blocking,
      warnings,
      confidence: 0.95,
      validationScore: score
    };
  }
}

export const validationReporter = new ValidationReporter();

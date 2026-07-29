import { ExecutionReport } from '../executor/executorTypes';

export class TestingValidator {
  public validateRequest(executionReport: Partial<ExecutionReport>, workspaceFolders: any[] | undefined): void {
    if (!executionReport) {
      throw new Error('Testing validation error: Missing execution report input');
    }
    if (!executionReport.executionId || !executionReport.planId) {
      throw new Error('Testing validation error: Invalid execution report content');
    }
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('Testing validation error: Invalid workspace folder - no folder is currently open');
    }
  }

  public validateFramework(framework: string): void {
    const supported = ['jest', 'vitest', 'mocha', 'simulated'];
    if (!supported.includes(framework.toLowerCase())) {
      throw new Error(`Testing validation error: Unknown or unsupported testing framework "${framework}"`);
    }
  }
}

export const testingValidator = new TestingValidator();

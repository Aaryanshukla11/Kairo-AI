import {
  ValidationReportModel,
  ValidationMode,
  ValidationMetricModel,
  OverfittingReport,
  CheckpointComparison
} from './validationTypes';

export class ValidationReportCompiler {
  public compileReport(
    sessionId: string,
    mode: ValidationMode,
    isValid: boolean,
    errors: string[],
    metrics: ValidationMetricModel,
    overfittingReport: OverfittingReport,
    checkpointComparison?: CheckpointComparison
  ): ValidationReportModel {
    const reportId = `REP-VAL-${sessionId}-${Date.now()}`;

    return {
      reportId,
      sessionId,
      mode,
      isValid,
      errors,
      metrics,
      overfittingReport,
      checkpointComparison,
      createdAt: Date.now()
    };
  }
}

export const validationReportCompiler = new ValidationReportCompiler();
export default validationReportCompiler;

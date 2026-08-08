import { IValidationDetails, IRiskIndicator } from '../contracts';

export class ValidationReporter {
  public createReport(
    isValid: boolean,
    errors: string[],
    warnings: string[],
    risks: IRiskIndicator[],
    durationMs: number
  ): IValidationDetails {
    return {
      isValid,
      errors: [...errors],
      warnings: [...warnings],
      risks: [...risks],
      validationDurationMs: durationMs
    };
  }
}

export const validationReporter = new ValidationReporter();
export default validationReporter;

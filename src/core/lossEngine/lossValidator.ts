import { ValidationReportModel } from './lossTypes';

export class LossValidator {
  public validate(
    outputs: number[],
    targets: number[]
  ): ValidationReportModel {
    const errors: string[] = [];

    // 1. Compatible length check
    if (outputs.length !== targets.length) {
      errors.push(`Validation Error: Target length (${targets.length}) does not match outputs length (${outputs.length}).`);
    }

    if (outputs.length === 0) {
      errors.push('Validation Error: Target and outputs lists cannot be empty.');
    }

    // 2. Check for NaNs and Infinities in outputs
    outputs.forEach((v, idx) => {
      if (Number.isNaN(v)) {
        errors.push(`Validation Error: NaN detected in outputs at index ${idx}.`);
      }
      if (!Number.isFinite(v)) {
        errors.push(`Validation Error: Infinity detected in outputs at index ${idx}.`);
      }
    });

    // 3. Check for NaNs and Infinities in targets
    targets.forEach((v, idx) => {
      if (Number.isNaN(v)) {
        errors.push(`Validation Error: NaN detected in targets at index ${idx}.`);
      }
      if (!Number.isFinite(v)) {
        errors.push(`Validation Error: Infinity detected in targets at index ${idx}.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateLossValue(loss: number): ValidationReportModel {
    const errors: string[] = [];

    if (Number.isNaN(loss)) {
      errors.push('Validation Error: Calculated loss is NaN.');
    }
    if (!Number.isFinite(loss)) {
      errors.push('Validation Error: Calculated loss is Infinity.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const lossValidator = new LossValidator();
export default lossValidator;

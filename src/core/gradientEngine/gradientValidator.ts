import { TensorGradientModel, ValidationReportModel } from './gradientTypes';

export class GradientValidator {
  public validate(
    layers: TensorGradientModel[],
    framework: string
  ): ValidationReportModel {
    const errors: string[] = [];

    // 1. Expected tensor count check
    if (layers.length === 0) {
      errors.push('Validation Error: Expecting at least one gradient tensor layer.');
    }

    // 2. Compatible framework check
    const allowed = ['pytorch', 'jax', 'tensorflow', 'mock'];
    if (!allowed.includes(framework)) {
      errors.push(`Validation Error: Unsupported gradient framework adapter [${framework}].`);
    }

    // 3. Check for NaNs and Infinities in values
    layers.forEach(l => {
      l.values.forEach(v => {
        if (Number.isNaN(v)) {
          errors.push(`Validation Error: NaN detected in layer ${l.layerName}.`);
        }
        if (!Number.isFinite(v)) {
          errors.push(`Validation Error: Infinity detected in layer ${l.layerName}.`);
        }
      });

      if (Number.isNaN(l.gradNorm) || !Number.isFinite(l.gradNorm)) {
        errors.push(`Validation Error: Invalid gradNorm in layer ${l.layerName}.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const gradientValidator = new GradientValidator();
export default gradientValidator;

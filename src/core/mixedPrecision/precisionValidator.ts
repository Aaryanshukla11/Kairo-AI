import { PrecisionPolicy, OverflowReport, CompatibilityReport } from './precisionTypes';

export interface PrecisionValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PrecisionValidator {
  public validate(
    policy: PrecisionPolicy,
    compatibilityReport: CompatibilityReport,
    overflowReport: OverflowReport
  ): PrecisionValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Hardware Compatibility
    if (!compatibilityReport.isCompatible) {
      errors.push(...compatibilityReport.issues);
    }
    warnings.push(...compatibilityReport.warnings);

    // 2. Scaling parameters validation
    if (policy.initialScale <= 0) {
      errors.push(`Initial loss scale must be strictly positive. Got: ${policy.initialScale}`);
    }
    if (policy.minScale <= 0) {
      errors.push(`Minimum loss scale must be strictly positive. Got: ${policy.minScale}`);
    }
    if (policy.maxScale < policy.minScale) {
      errors.push(`Maximum loss scale (${policy.maxScale}) cannot be less than minimum loss scale (${policy.minScale})`);
    }

    if (policy.lossScalingMode === 'dynamic') {
      if (policy.growthFactor !== undefined && policy.growthFactor <= 1.0) {
        errors.push(`Dynamic scaling growth factor must be greater than 1.0. Got: ${policy.growthFactor}`);
      }
      if (policy.backoffFactor !== undefined && (policy.backoffFactor <= 0.0 || policy.backoffFactor >= 1.0)) {
        errors.push(`Dynamic scaling backoff factor must be between 0.0 and 1.0 (exclusive). Got: ${policy.backoffFactor}`);
      }
      if (policy.hysteresis !== undefined && policy.hysteresis <= 0) {
        errors.push(`Dynamic scaling hysteresis window steps must be positive. Got: ${policy.hysteresis}`);
      }
    }

    // 3. Overflow monitor validation
    if (overflowReport.persistentOverflow) {
      errors.push('Persistent overflow detected in training gradients. Loss scaling factor is at its minimum and cannot prevent NaN/Inf values.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const precisionValidator = new PrecisionValidator();
export default precisionValidator;

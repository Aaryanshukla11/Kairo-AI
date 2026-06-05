import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ValidationMetricModel } from '../validationLoop/validationTypes';
import { StoppingPolicyConfig } from './stoppingTypes';

export interface StoppingValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class StoppingValidator {
  public validateInputs(
    session?: TrainingSessionModel,
    config?: TrainingConfigModel,
    valMetrics?: ValidationMetricModel,
    policies?: StoppingPolicyConfig[]
  ): StoppingValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Session verification
    if (!session) {
      errors.push('Training session is missing.');
    } else {
      if (!session.sessionId) {
        errors.push('Training session is invalid: sessionId is missing.');
      }
      if (session.currentStep < 0) {
        errors.push('Current training step cannot be negative.');
      }
    }

    // 2. Configuration verification
    if (!config) {
      warnings.push('Training config model is missing. Utilizing defaults.');
    }

    // 3. Validation metrics verification
    if (valMetrics) {
      if (valMetrics.validationLoss < 0) {
        errors.push(`Validation loss cannot be negative. Got: ${valMetrics.validationLoss}`);
      }
      if (valMetrics.accuracy < 0 || valMetrics.accuracy > 1) {
        errors.push(`Validation accuracy must be between 0.0 and 1.0. Got: ${valMetrics.accuracy}`);
      }
      if (valMetrics.perplexity <= 0) {
        errors.push(`Validation perplexity must be positive. Got: ${valMetrics.perplexity}`);
      }
    } else {
      warnings.push('Validation metrics not present for this evaluation step.');
    }

    // 4. Stopping Policies verification
    if (policies) {
      if (policies.length === 0) {
        errors.push('Policies list is empty.');
      }
      for (const policy of policies) {
        if (policy.patienceWindow <= 0) {
          errors.push(`Patience window must be greater than zero. Got: ${policy.patienceWindow}`);
        }
        if (policy.minImprovement !== undefined && policy.minImprovement < 0) {
          errors.push(`Min improvement cannot be negative. Got: ${policy.minImprovement}`);
        }
        if (policy.mode !== 'min' && policy.mode !== 'max') {
          errors.push(`Invalid evaluation mode: ${policy.mode}. Must be 'min' or 'max'.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const stoppingValidator = new StoppingValidator();
export default stoppingValidator;

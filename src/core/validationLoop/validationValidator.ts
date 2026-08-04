import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ValidationMetricModel } from './validationTypes';

export interface ValidationLoopValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationValidator {
  public validateInputs(
    checkpoint?: CheckpointModel,
    validationDatasetPath?: string,
    trainingConfig?: TrainingConfigModel,
    metrics?: ValidationMetricModel
  ): ValidationLoopValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Checkpoint validation
    if (!checkpoint) {
      errors.push('No checkpoint provided for validation pass.');
    } else {
      if (!checkpoint.checkpointId) {
        errors.push('Invalid checkpoint model: checkpointId is missing.');
      }
      if (checkpoint.trainingStep === undefined || checkpoint.trainingStep < 0) {
        errors.push('Invalid checkpoint model: trainingStep is invalid or negative.');
      }
    }

    // 2. Dataset validation
    if (!validationDatasetPath) {
      errors.push('Validation dataset path is missing.');
    } else if (validationDatasetPath.trim().length === 0) {
      errors.push('Validation dataset path is empty.');
    }

    // 3. Training config validation
    if (!trainingConfig) {
      warnings.push('Training configuration was not provided. Defaulting parameters.');
    } else {
      if (!trainingConfig.configId) {
        errors.push('Invalid training configuration: configId is missing.');
      }
    }

    // 4. Metrics validation (if already executed or checking compiled results)
    if (metrics) {
      if (metrics.validationLoss < 0) {
        errors.push(`Validation loss cannot be negative. Got: ${metrics.validationLoss}`);
      }
      if (metrics.accuracy < 0 || metrics.accuracy > 1.0) {
        errors.push(`Validation accuracy must be between 0.0 and 1.0. Got: ${metrics.accuracy}`);
      }
      if (metrics.perplexity <= 0) {
        errors.push(`Validation perplexity must be strictly positive. Got: ${metrics.perplexity}`);
      }
      if (metrics.passRate < 0 || metrics.passRate > 1.0) {
        errors.push(`Validation pass rate must be between 0.0 and 1.0. Got: ${metrics.passRate}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const validationValidator = new ValidationValidator();
export default validationValidator;

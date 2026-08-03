import { TrainingConfigModel, ValidationReportModel } from './configurationTypes';
import { optimizerManager } from './optimizerManager';
import { schedulerManager } from './schedulerManager';

export class ConfigurationValidator {
  public validate(config: TrainingConfigModel): ValidationReportModel {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Incompatible dataset check
    if (!config.datasetVersion) {
      errors.push('Validation Error: Dataset version string is required.');
    }

    // 2. Incompatible tokenizer check
    if (!config.tokenizerVersion) {
      errors.push('Validation Error: Tokenizer version string is required.');
    }

    // 3. Valid optimizer check
    if (!optimizerManager.isValid(config.hyperparameters.optimizer)) {
      errors.push(`Validation Error: Optimizer [${config.hyperparameters.optimizer}] is not supported. Allowed: ${optimizerManager.listAllowed().join(', ')}`);
    }

    // 4. Valid scheduler check
    if (!schedulerManager.isValid(config.hyperparameters.scheduler)) {
      errors.push(`Validation Error: Scheduler [${config.hyperparameters.scheduler}] is not supported. Allowed: ${schedulerManager.listAllowed().join(', ')}`);
    }

    // 5. Supported precision check
    const allowedPrecisions = ['fp32', 'fp16', 'bf16'];
    if (!allowedPrecisions.includes(config.hyperparameters.precision)) {
      errors.push(`Validation Error: Precision [${config.hyperparameters.precision}] is not supported. Allowed: ${allowedPrecisions.join(', ')}`);
    }

    // 6. Compatible hardware check
    const hardware = config.hardwareProfile;
    if (hardware.deviceCount <= 0) {
      errors.push('Validation Error: Device count must be greater than 0.');
    }
    if (hardware.deviceType !== 'cpu' && hardware.deviceType !== 'cuda' && hardware.deviceType !== 'tpu') {
      errors.push(`Validation Error: Hardware device type [${hardware.deviceType}] is not supported.`);
    }

    // Batch size compatibility warn
    if (config.hyperparameters.batchSize > hardware.maxBatchSize) {
      warnings.push(`Warning: Configured batch size (${config.hyperparameters.batchSize}) exceeds hardware profile max batch size limit (${hardware.maxBatchSize}). This might trigger OOM (Out Of Memory) errors.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const configurationValidator = new ConfigurationValidator();
export default configurationValidator;

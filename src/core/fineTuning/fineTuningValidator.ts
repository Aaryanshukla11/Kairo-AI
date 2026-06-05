import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';

export interface FineTuningValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class FineTuningValidator {
  public validateSetup(
    baseModelId: string,
    tokenizerVersion: string,
    datasetVersion: string,
    config: TrainingConfigModel,
    adapterSettings?: any
  ): FineTuningValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Base Model checks
    if (!baseModelId) {
      errors.push('Base model ID is missing.');
    } else if (baseModelId.trim().length === 0) {
      errors.push('Base model ID is empty.');
    }

    // 2. Tokenizer checks
    if (!tokenizerVersion) {
      errors.push('Tokenizer version is missing.');
    }

    // 3. Dataset checks
    if (!datasetVersion) {
      errors.push('Dataset version is missing.');
    }

    // 4. Configuration checks
    if (!config) {
      errors.push('Training configuration model is missing.');
    } else {
      if (!config.configId) {
        errors.push('Training configuration is invalid: configId is missing.');
      }
      if (!config.hyperparameters) {
        errors.push('Training configuration hyperparameters are missing.');
      }
    }

    // 5. Adapter checks if using LoRA/QLoRA
    if (adapterSettings) {
      if (adapterSettings.r !== undefined && (adapterSettings.r <= 0 || adapterSettings.r > 256)) {
        errors.push(`Invalid LoRA rank: ${adapterSettings.r}. Rank must be between 1 and 256.`);
      }
      if (adapterSettings.alpha !== undefined && adapterSettings.alpha <= 0) {
        errors.push(`Invalid LoRA alpha: ${adapterSettings.alpha}. Alpha must be positive.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const fineTuningValidator = new FineTuningValidator();
export default fineTuningValidator;

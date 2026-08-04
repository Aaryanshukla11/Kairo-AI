import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ExportFormat } from './exportTypes';

export interface ExportValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ExportValidator {
  public validateSetup(
    checkpoint?: CheckpointModel,
    config?: TrainingConfigModel,
    format?: ExportFormat,
    tokenizerVersion?: string
  ): ExportValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Checkpoint validation
    if (!checkpoint) {
      errors.push('No model checkpoint provided.');
    } else {
      if (!checkpoint.checkpointId) {
        errors.push('Invalid checkpoint: checkpointId is missing.');
      }
      if (!checkpoint.checksum) {
        errors.push('Invalid checkpoint: checksum is missing.');
      }
    }

    // 2. Configuration validation
    if (!config) {
      errors.push('Training configuration model is missing.');
    }

    // 3. Format validation
    const supportedFormats: ExportFormat[] = ['gguf', 'safetensors', 'onnx', 'huggingface', 'pytorch'];
    if (!format) {
      errors.push('No export format specified.');
    } else if (!supportedFormats.includes(format)) {
      errors.push(`Unsupported export format: ${format}. Supported: ${supportedFormats.join(', ')}`);
    }

    // 4. Tokenizer validation
    if (!tokenizerVersion) {
      errors.push('Tokenizer version is missing.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const exportValidator = new ExportValidator();
export default exportValidator;

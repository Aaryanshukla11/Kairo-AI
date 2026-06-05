import { ModelInfo, ModelState } from './registryTypes';

export class RegistryValidator {
  public validate(model: ModelInfo): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!model.modelId) {
      errors.push('Metadata validation error: Model ID is required.');
    }
    if (!model.displayName) {
      errors.push('Metadata validation error: Display name is required.');
    }
    if (!model.provider) {
      errors.push('Metadata validation error: Provider is required.');
    }
    if (!model.format) {
      errors.push('Metadata validation error: Format is required.');
    } else if (!['gguf', 'onnx', 'mlx', 'custom'].includes(model.format.toLowerCase())) {
      warnings.push(`Unrecognized format: ${model.format}`);
    }

    if (!model.tokenizer) {
      errors.push('Metadata validation error: Tokenizer is required.');
    }
    if (model.contextLength <= 0) {
      errors.push('Metadata validation error: Context length must be greater than 0.');
    }
    if (model.memoryRequirementGb <= 0) {
      warnings.push('Memory requirement is not specified or invalid.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  public isCompatible(model: ModelInfo, systemRamGb: number): boolean {
    return systemRamGb >= model.memoryRequirementGb;
  }
}

export const registryValidator = new RegistryValidator();

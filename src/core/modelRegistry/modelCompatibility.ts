import { ModelInfo, CompatibilityReport } from './registryTypes';

export class ModelCompatibilityAnalyzer {
  public generateReport(model: ModelInfo, systemRamGb: number, os: string, arch: string): CompatibilityReport {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Ram compatibility
    if (systemRamGb < model.memoryRequirementGb) {
      issues.push(`Insufficient System RAM: Model requires ${model.memoryRequirementGb} GB, but only ${systemRamGb} GB is available.`);
    } else if (systemRamGb - model.memoryRequirementGb < 4) {
      warnings.push(`Low Memory Overhead: Running this model leaves less than 4 GB of free system RAM.`);
    }

    // Provider / Format compatibility
    if (model.format === 'mlx') {
      if (os !== 'darwin' || arch !== 'arm64') {
        issues.push('MLX Format Incompatibility: MLX models are only compatible with macOS running on Apple Silicon (arm64).');
      }
    }

    // Parameter checks
    const sizeMatch = model.parameters.match(/(\d+)B/i);
    if (sizeMatch) {
      const billionParams = parseInt(sizeMatch[1]);
      if (billionParams > 13 && systemRamGb <= 16) {
        warnings.push(`High Parameter Warning: ${model.parameters} model might exhibit high latency or crash on a 16GB system.`);
      }
    }

    return {
      modelId: model.modelId,
      compatible: issues.length === 0,
      issues,
      warnings,
      requiredRamGb: model.memoryRequirementGb,
      availableRamGb: systemRamGb
    };
  }
}

export const modelCompatibilityAnalyzer = new ModelCompatibilityAnalyzer();

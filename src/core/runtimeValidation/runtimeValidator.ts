import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from './runtimeTypes';
import { modelLoaderValidator } from './modelLoaderValidator';
import { inferenceValidator } from './inferenceValidator';
import { streamingValidator } from './streamingValidator';
import { promptPipelineValidator } from './promptPipelineValidator';
import { contextPipelineValidator } from './contextPipelineValidator';

export class RuntimeValidator implements IRuntimeValidationProvider {
  public readonly id = 'runtime-validator-core';
  public readonly name = 'Runtime Environment Validator';
  public readonly targetSubsystem = 'Runtime';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let scoreSum = 0;
    let counts = 0;

    const validators = [
      modelLoaderValidator,
      inferenceValidator,
      streamingValidator,
      promptPipelineValidator,
      contextPipelineValidator
    ];

    for (const val of validators) {
      try {
        const res = await val.validate(context);
        scoreSum += res.score;
        counts++;
        if (res.errors) errors.push(...res.errors.map(e => `[${val.name}] ${e}`));
        if (res.warnings) warnings.push(...res.warnings.map(w => `[${val.name}] ${w}`));
      } catch (err: any) {
        errors.push(`[${val.name}] Validation Crashed: ${err.message || err}`);
        counts++;
      }
    }

    const score = counts > 0 ? Math.round(scoreSum / counts) : 100;
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: 'Executed runtime loading checks, prompt builders checks, context injection audits, detokenizers, and streaming responses.',
      errors,
      warnings,
      metrics: {
        totalSubChecks: validators.length,
        failedSubChecks: errors.length
      }
    };
  }
}

export const runtimeValidator = new RuntimeValidator();
export default runtimeValidator;

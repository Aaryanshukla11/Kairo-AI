import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';
import { pipelineExecutor } from './pipelineExecutor';

export class IntegrationValidator implements IValidationProvider {
  public readonly id = 'integration-validator';
  public readonly name = 'Full Pipeline Integration Validator';
  public readonly targetSubsystem = 'Integration';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const runId = `run-${Date.now()}`;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Run the pipeline execution
    const steps = await pipelineExecutor.executePipeline(runId);

    let passedSteps = 0;
    let totalDuration = 0;
    const stageRuntimes: Record<string, number> = {};

    for (const step of steps) {
      totalDuration += step.durationMs;
      stageRuntimes[`${step.stage.replace(/\s+/g, '')}DurationMs`] = step.durationMs;
      
      if (step.status === 'Success') {
        passedSteps++;
      } else {
        errors.push(`Stage '${step.stage}' failed: ${step.error || 'Unknown error'}`);
      }

      if (!step.outputPassed && step.status === 'Success') {
        warnings.push(`Stage '${step.stage}' passed but output integrity check flagged issues.`);
      }
    }

    const score = Math.round((passedSteps / steps.length) * 100);
    const status = score === 100 ? 'Passed' : score >= 80 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Executed integration workflow pipeline containing ${steps.length} stages in ${totalDuration}ms. Passed ${passedSteps}/${steps.length} stages.`,
      errors,
      warnings,
      metrics: {
        totalStages: steps.length,
        passedStages: passedSteps,
        totalDurationMs: totalDuration,
        ...stageRuntimes
      }
    };
  }
}

export const integrationValidator = new IntegrationValidator();

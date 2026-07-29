import { GenerationContext } from './generationTypes';

export class GenerationContextBuilder {
  public buildContext(plan: any): GenerationContext {
    const targetPath = plan.targetPath || 'src/core/generated';
    const language = plan.language || 'typescript';
    const projectConventions = plan.conventions || ['STRICT_TYPES', 'NO_ANY'];

    return {
      planId: plan.planId || `plan-${Date.now()}`,
      targetPath,
      language,
      projectConventions
    };
  }
}

export const generationContextBuilder = new GenerationContextBuilder();

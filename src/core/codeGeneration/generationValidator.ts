import { GenerationStrategy, GenerationContext, GenerationArtifact } from './generationTypes';

export class GenerationValidator {
  public validatePlan(plan: any): void {
    if (!plan) {
      throw new Error('Code Generation validation error: Missing execution plan specifications');
    }
    if (!plan.tasks || plan.tasks.length === 0) {
      throw new Error('Code Generation validation error: Missing plan tasks listing');
    }
  }

  public validateContext(context: GenerationContext): void {
    if (!context) {
      throw new Error('Code Generation validation error: Missing generation context');
    }
    if (!context.targetPath) {
      throw new Error('Code Generation validation error: Missing targetPath folder target');
    }
    if (context.language !== 'typescript' && context.language !== 'javascript') {
      throw new Error(`Code Generation validation error: Unsupported language "${context.language}"`);
    }
  }

  public validateStrategy(strategy: any): void {
    const valid = Object.values(GenerationStrategy);
    if (!valid.includes(strategy)) {
      throw new Error(`Code Generation validation error: Invalid strategy choice "${strategy}"`);
    }
  }

  public validateArtifact(artifact: GenerationArtifact): void {
    if (!artifact) {
      throw new Error('Code Generation validation error: Broken generation artifact (is empty)');
    }
    if (!artifact.files || artifact.files.length === 0) {
      throw new Error('Code Generation validation error: Broken generation artifact - no files list generated');
    }
    for (const f of artifact.files) {
      if (!f.content || f.content.trim() === '') {
        throw new Error(`Code Generation validation error: Broken generation artifact - file "${f.path}" content is empty`);
      }
    }
  }
}

export const generationValidator = new GenerationValidator();

import { PromptAssemblyRequest, PromptPackage } from './promptTypes';

export class PromptValidator {
  /**
   * Asserts request parameters, checking prompt content.
   */
  public validateRequest(request: PromptAssemblyRequest): void {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error('Prompt assembly validation error: Request prompt is required and cannot be empty');
    }
  }

  /**
   * Asserts compiled output package token limits.
   */
  public validatePackage(pkg: PromptPackage, limit: number = 100000): void {
    if (pkg.estimatedTokens > limit) {
      throw new Error(`Prompt assembly validation error: Oversized prompt: Estimated ${pkg.estimatedTokens} tokens, which exceeds the limit of ${limit}`);
    }
  }
}

export const promptValidator = new PromptValidator();

import { PromptRequest } from './promptTypes';

export class PromptValidator {
  public validate(request: PromptRequest, compiledPrompt: string, tokenLimit = 32768): void {
    if (!request.userPrompt || !request.userPrompt.trim()) {
      throw new Error('Prompt validation error: User request prompt cannot be empty.');
    }

    if (!compiledPrompt || !compiledPrompt.includes('User Request:')) {
      throw new Error('Prompt validation error: Compiled prompt lacks User Request section.');
    }

    const approxTokens = Math.ceil(compiledPrompt.length / 4);
    if (approxTokens > tokenLimit) {
      throw new Error(`Prompt validation error: Compiled prompt size ${approxTokens} exceeds limit of ${tokenLimit} tokens.`);
    }

    // Check duplicate header markers
    const occurrences = (compiledPrompt.match(/=== SOURCE:/g) || []).length;
    if (occurrences > 10) {
      throw new Error('Prompt validation error: Too many duplicated context source headers.');
    }
  }
}

export const promptValidator = new PromptValidator();

import { Prompt } from './Prompt';

export interface PromptValidationResult {
  valid: boolean;
  errors: string[];
}

export class PromptValidator {
  public static readonly MAX_PROMPT_LENGTH = 100000;

  public static validate(promptPayload: any): PromptValidationResult {
    const errors: string[] = [];

    if (!promptPayload) {
      return { valid: false, errors: ['Prompt payload is null or undefined.'] };
    }

    if (typeof promptPayload.rawPrompt !== 'string') {
      errors.push('rawPrompt must be a string.');
    } else {
      if (promptPayload.rawPrompt.trim().length === 0) {
        errors.push('Prompt cannot be empty or whitespace-only.');
      }
      if (promptPayload.rawPrompt.length > this.MAX_PROMPT_LENGTH) {
        errors.push(`Prompt exceeds maximum length of ${this.MAX_PROMPT_LENGTH} characters.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

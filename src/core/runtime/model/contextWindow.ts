import { tokenizer } from './tokenizer';

export class ContextWindow {
  /**
   * Truncates text if context window size thresholds are crossed.
   */
  public enforceLimit(text: string, maxTokens: number): string {
    const tokens = tokenizer.countTokens(text);
    if (tokens <= maxTokens) return text;
    return text.slice(-(maxTokens * 4));
  }
}

export const contextWindow = new ContextWindow();

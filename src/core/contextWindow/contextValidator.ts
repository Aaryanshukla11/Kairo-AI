import { ContextItem } from './contextTypes';

export class ContextValidator {
  public validate(items: ContextItem[], tokenLimit: number): void {
    let totalTokens = 0;
    const ids = new Set<string>();

    for (const item of items) {
      if (ids.has(item.id)) {
        throw new Error(`Context validation error: Duplicate item ID detected: ${item.id}`);
      }
      ids.add(item.id);
      totalTokens += item.tokenCount;
    }

    if (totalTokens > tokenLimit) {
      throw new Error(`Context validation error: Compiled context size ${totalTokens} tokens exceeds model window limit of ${tokenLimit} tokens.`);
    }

    // Ensure critical context items aren't discarded
    const missingCritical = items.filter(item => item.priority === 'Critical' && item.tokenCount <= 0);
    if (missingCritical.length > 0) {
      throw new Error(`Context validation error: Critical context items are empty.`);
    }
  }
}

export const contextValidator = new ContextValidator();

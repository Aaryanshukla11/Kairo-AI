import { ContextItem } from './contextTypes';

export class ContextAssembler {
  public assemble(items: ContextItem[]): string {
    let result = '';

    for (const item of items) {
      if (item.source === 'system' || item.source === 'user') {
        // Prompts are compiled separately, so we bypass them in compiled context block
        continue;
      }
      result += `=== SOURCE: ${item.source.toUpperCase()} [ID: ${item.id}] ===\n`;
      result += `${item.content}\n\n`;
    }

    return result.trim();
  }
}

export const contextAssembler = new ContextAssembler();

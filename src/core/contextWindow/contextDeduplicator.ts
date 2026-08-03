import { ContextItem } from './contextTypes';

export class ContextDeduplicator {
  public deduplicate(items: ContextItem[]): ContextItem[] {
    const seen = new Set<string>();
    const unique: ContextItem[] = [];

    for (const item of items) {
      // Deduplicate identical content or IDs
      const normalizedContent = item.content.trim().toLowerCase();
      if (!seen.has(normalizedContent) && !seen.has(item.id)) {
        seen.add(normalizedContent);
        seen.add(item.id);
        unique.push(item);
      }
    }

    return unique;
  }
}

export const contextDeduplicator = new ContextDeduplicator();

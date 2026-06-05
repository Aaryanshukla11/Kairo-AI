export class JsonCleaner {
  public cleanJson(content: string): { content: string; isCleaned: boolean } {
    if (!content) return { content: '', isCleaned: false };

    try {
      const parsed = JSON.parse(content);
      const cleaned = JSON.stringify(parsed, null, 2);
      return {
        content: cleaned,
        isCleaned: cleaned !== content
      };
    } catch {
      // If it cannot parse, return original
      return {
        content,
        isCleaned: false
      };
    }
  }
}

export const jsonCleaner = new JsonCleaner();

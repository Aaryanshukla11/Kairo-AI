export class TextCleaner {
  public cleanText(content: string): { content: string; isCleaned: boolean } {
    if (!content) return { content: '', isCleaned: false };

    // Standardize line endings and collapse empty lines
    const normalized = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    return {
      content: normalized,
      isCleaned: normalized !== content
    };
  }
}

export const textCleaner = new TextCleaner();

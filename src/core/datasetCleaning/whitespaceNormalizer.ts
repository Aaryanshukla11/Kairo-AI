export class WhitespaceNormalizer {
  public normalizeWhitespace(content: string): { normalized: string; isModified: boolean } {
    if (!content) {
      return { normalized: '', isModified: false };
    }

    // 1. Normalize line endings to LF
    let current = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Trim trailing spaces on each line
    current = current.split('\n').map(line => line.trimEnd()).join('\n');

    // 3. Collapse multiple consecutive blank lines (maximum 2 consecutive newlines)
    current = current.replace(/\n{3,}/g, '\n\n');

    // 4. Trim start and end of document
    const trimmed = current.trim();

    return {
      normalized: trimmed,
      isModified: trimmed !== content
    };
  }
}

export const whitespaceNormalizer = new WhitespaceNormalizer();

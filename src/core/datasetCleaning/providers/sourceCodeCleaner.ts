export class SourceCodeCleaner {
  public cleanSourceCode(content: string): { content: string; cleanedLines: number } {
    if (!content) return { content: '', cleanedLines: 0 };

    const lines = content.split('\n');
    let cleanedCount = 0;

    const cleanedLines = lines.map(line => {
      // Strip trailing whitespaces
      const trimmed = line.trimEnd();
      if (trimmed !== line) {
        cleanedCount++;
      }
      return trimmed;
    });

    return {
      content: cleanedLines.join('\n'),
      cleanedLines: cleanedCount
    };
  }
}

export const sourceCodeCleaner = new SourceCodeCleaner();

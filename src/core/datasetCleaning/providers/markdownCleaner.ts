export class MarkdownCleaner {
  public cleanMarkdown(content: string): { content: string; cleanedBlocks: number } {
    if (!content) return { content: '', cleanedBlocks: 0 };

    let cleanedCount = 0;
    // Normalize consecutive blank lines in markdown to double newlines max
    let normalized = content.replace(/\n{3,}/g, '\n\n');
    if (normalized !== content) {
      cleanedCount++;
    }

    // Fix malformed headings (e.g. '#Heading' -> '# Heading')
    const repaired = normalized.replace(/^(#{1,6})([^#\s].*)$/gm, (match, hashes, text) => {
      cleanedCount++;
      return `${hashes} ${text}`;
    });

    return {
      content: repaired,
      cleanedBlocks: cleanedCount
    };
  }
}

export const markdownCleaner = new MarkdownCleaner();

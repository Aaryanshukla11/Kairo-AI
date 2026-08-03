export class DocumentationCleaner {
  public cleanDoc(content: string): { content: string; isCleaned: boolean } {
    if (!content) return { content: '', isCleaned: false };

    // Strip HTML comments from documentation if present
    const cleaned = content.replace(/<!--[\s\S]*?-->/g, '').trim();

    return {
      content: cleaned,
      isCleaned: cleaned !== content
    };
  }
}

export const documentationCleaner = new DocumentationCleaner();

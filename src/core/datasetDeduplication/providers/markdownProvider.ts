export class MarkdownProvider {
  public normalizeMarkdown(content: string): string {
    if (!content) return '';

    // Strip links [text](url) -> text
    let md = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Strip images ! [text](url) -> ''
    md = md.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

    // Strip inline formatting (*, _, `, etc.)
    md = md.replace(/[*_`~#\-+>]/g, ' ');

    // Normalize spacing
    return md.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  public getMarkdownTokens(content: string): string[] {
    const normalized = this.normalizeMarkdown(content);
    return normalized.split(/\s+/).filter(t => t.length > 0);
  }
}

export const markdownProvider = new MarkdownProvider();
export default markdownProvider;

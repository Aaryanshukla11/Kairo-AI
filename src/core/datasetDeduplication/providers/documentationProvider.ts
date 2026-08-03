export class DocumentationProvider {
  public normalizeDocumentation(content: string): string {
    if (!content) return '';
    // Documentation files might have API blocks, headers, templates. Strip comments and whitespace.
    return content.toLowerCase().replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
  }

  public getTokens(content: string): string[] {
    return this.normalizeDocumentation(content).split(/\s+/).filter(t => t.length > 0);
  }
}

export const documentationProvider = new DocumentationProvider();
export default documentationProvider;

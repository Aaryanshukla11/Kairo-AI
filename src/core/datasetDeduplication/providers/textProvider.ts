export class TextProvider {
  public normalizeText(content: string): string {
    if (!content) return '';
    return content.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  public getTokens(content: string): string[] {
    return this.normalizeText(content).split(/\s+/).filter(t => t.length > 0);
  }
}

export const textProvider = new TextProvider();
export default textProvider;

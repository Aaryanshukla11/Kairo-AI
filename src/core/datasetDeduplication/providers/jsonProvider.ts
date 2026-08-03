export class JsonProvider {
  public normalizeJson(content: string): string {
    if (!content) return '';

    try {
      const parsed = JSON.parse(content);
      const sorted = this.sortKeys(parsed);
      return JSON.stringify(sorted);
    } catch {
      return content.replace(/\s+/g, '').trim();
    }
  }

  private sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortKeys(item));
    }

    const sortedObj: any = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sortedObj[key] = this.sortKeys(obj[key]);
    }

    return sortedObj;
  }

  public getJsonTokens(content: string): string[] {
    const normalized = this.normalizeJson(content);
    // Split on brackets, braces, and commas to get structural elements and key-value tokens
    return normalized.split(/([{}[\],:])/).filter(t => t.trim().length > 0);
  }
}

export const jsonProvider = new JsonProvider();
export default jsonProvider;

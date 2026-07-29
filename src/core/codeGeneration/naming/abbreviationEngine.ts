export class AbbreviationEngine {
  private abbrevMap = new Map<string, string>([
    ['auth', 'authorization'],
    ['config', 'configuration'],
    ['db', 'database'],
    ['ctrl', 'controller'],
    ['srv', 'service'],
    ['repo', 'repository']
  ]);

  public expand(term: string): string {
    const t = term.toLowerCase();
    return this.abbrevMap.get(t) || term;
  }
}

export const abbreviationEngine = new AbbreviationEngine();

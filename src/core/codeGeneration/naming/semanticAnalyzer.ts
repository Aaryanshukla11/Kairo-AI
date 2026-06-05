export class SemanticAnalyzer {
  public inferIntent(purpose: string): string {
    const p = purpose.toLowerCase();
    if (p.includes('save') || p.includes('load') || p.includes('db')) {
      return 'Repository';
    }
    if (p.includes('controller') || p.includes('route')) {
      return 'Controller';
    }
    if (p.includes('component') || p.includes('view') || p.includes('page')) {
      return 'Component';
    }
    return 'Service';
  }
}

export const semanticAnalyzer = new SemanticAnalyzer();

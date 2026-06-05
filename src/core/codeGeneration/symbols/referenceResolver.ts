export class ReferenceResolver {
  public resolveReferences(content: string, definedSymbols: string[]): string[] {
    const refs: string[] = [];
    for (const sym of definedSymbols) {
      if (content.includes(sym)) {
        refs.push(sym);
      }
    }
    return refs;
  }
}

export const referenceResolver = new ReferenceResolver();

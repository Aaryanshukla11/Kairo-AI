import { SymbolDefinition } from './symbolTypes';

export class SymbolValidator {
  public validateDefinitions(symbols: SymbolDefinition[]): void {
    const seen = new Set<string>();
    for (const sym of symbols) {
      const uniqueKey = `${sym.namespace}.${sym.name}`;
      if (seen.has(uniqueKey)) {
        throw new Error(`Symbol Resolution validation error: Duplicate definition detected for symbol "${sym.name}" inside namespace "${sym.namespace}"`);
      }
      seen.add(uniqueKey);
    }
  }

  public validateVisibility(sym: SymbolDefinition, accessorFile: string): void {
    if (sym.visibility === 'private' && sym.namespace !== accessorFile) {
      throw new Error(`Symbol Resolution validation error: Visibility violation. Cannot access private symbol "${sym.name}" of namespace "${sym.namespace}" from "${accessorFile}"`);
    }
  }
}

export const symbolValidator = new SymbolValidator();

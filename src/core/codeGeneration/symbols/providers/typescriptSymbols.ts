import { SymbolProvider } from '../symbolRegistry';

export class TypeScriptSymbols implements SymbolProvider {
  public name = 'TypeScriptSymbolsRules';

  public isReserved(symbol: string): boolean {
    return ['any', 'never', 'unknown', 'namespace', 'module', 'type'].includes(symbol);
  }
}

export const typescriptSymbols = new TypeScriptSymbols();

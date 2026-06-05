import { SymbolProvider } from '../symbolRegistry';

export class NodeSymbols implements SymbolProvider {
  public name = 'NodeSymbolsRules';

  public isReserved(symbol: string): boolean {
    return ['require', 'exports', 'module', 'process', 'global', 'Buffer'].includes(symbol);
  }
}

export const nodeSymbols = new NodeSymbols();

import { SymbolProvider } from '../symbolRegistry';

export class ReactSymbols implements SymbolProvider {
  public name = 'ReactSymbolsRules';

  public isReserved(symbol: string): boolean {
    return ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo'].includes(symbol);
  }
}

export const reactSymbols = new ReactSymbols();

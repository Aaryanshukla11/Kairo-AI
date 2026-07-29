import { SymbolProvider } from '../symbolRegistry';

export class JavaScriptSymbols implements SymbolProvider {
  public name = 'JavaScriptSymbolsRules';

  public isReserved(symbol: string): boolean {
    return ['window', 'document', 'undefined', 'null', 'prototype'].includes(symbol);
  }
}

export const javascriptSymbols = new JavaScriptSymbols();

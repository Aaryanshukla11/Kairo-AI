import { SymbolDefinition } from './symbolTypes';

export class SymbolResolver {
  public resolveMatch(symbolName: string, namespace: string): SymbolDefinition {
    let kind: 'Class' | 'Interface' | 'Function' | 'Variable' | 'Method' | 'Namespace' = 'Class';
    if (symbolName.charAt(0) === 'I' && symbolName.charAt(1) === symbolName.charAt(1).toUpperCase()) {
      kind = 'Interface';
    } else if (symbolName.charAt(0) === symbolName.charAt(0).toLowerCase()) {
      kind = 'Function';
    }

    return {
      name: symbolName,
      kind,
      visibility: 'public',
      namespace
    };
  }
}

export const symbolResolver = new SymbolResolver();

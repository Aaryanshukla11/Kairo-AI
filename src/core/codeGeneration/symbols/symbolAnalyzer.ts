import { SymbolDefinition } from './symbolTypes';

export class SymbolAnalyzer {
  public parseExisting(content: string, namespace: string): SymbolDefinition[] {
    const lines = content.split('\n');
    const symbols: SymbolDefinition[] = [];

    for (const line of lines) {
      const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], kind: 'Class', visibility: 'public', namespace });
        continue;
      }
      const interfaceMatch = line.match(/(?:export\s+)?interface\s+([a-zA-Z0-9_]+)/);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], kind: 'Interface', visibility: 'public', namespace });
        continue;
      }
      const functionMatch = line.match(/(?:export\s+)?function\s+([a-zA-Z0-9_]+)/);
      if (functionMatch) {
        symbols.push({ name: functionMatch[1], kind: 'Function', visibility: 'public', namespace });
        continue;
      }
    }

    return symbols;
  }
}

export const symbolAnalyzer = new SymbolAnalyzer();

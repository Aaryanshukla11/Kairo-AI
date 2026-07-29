import { WorkspaceSymbol, SymbolType } from './indexTypes';

export class SymbolIndexer {
  /**
   * Scans text content lines with regular expressions to collect symbol targets.
   */
  public indexSymbols(filePath: string, content: string): WorkspaceSymbol[] {
    const symbols: WorkspaceSymbol[] = [];
    const lines = content.split('\n');

    const classRegex = /(?:export\s+)?class\s+([A-Za-z0-9_]+)/;
    const interfaceRegex = /(?:export\s+)?interface\s+([A-Za-z0-9_]+)/;
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/;
    const arrowFuncRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;
    const typeRegex = /(?:export\s+)?type\s+([A-Za-z0-9_]+)\s*=/;
    const enumRegex = /(?:export\s+)?enum\s+([A-Za-z0-9_]+)/;

    const isComponent = (name: string) => /^[A-Z][A-Za-z0-9_]*/.test(name);
    const isHook = (name: string) => /^use[A-Z][A-Za-z0-9_]*/.test(name);

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      const classMatch = classRegex.exec(lineText);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: SymbolType.Class, filePath, line: lineNum });
        return;
      }

      const interfaceMatch = interfaceRegex.exec(lineText);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], type: SymbolType.Interface, filePath, line: lineNum });
        return;
      }

      const funcMatch = functionRegex.exec(lineText);
      if (funcMatch) {
        const name = funcMatch[1];
        let type = SymbolType.Function;
        if (isHook(name)) type = SymbolType.Hook;
        else if (isComponent(name)) type = SymbolType.Component;
        symbols.push({ name, type, filePath, line: lineNum });
        return;
      }

      const arrowMatch = arrowFuncRegex.exec(lineText);
      if (arrowMatch) {
        const name = arrowMatch[1];
        let type = SymbolType.Function;
        if (isHook(name)) type = SymbolType.Hook;
        else if (isComponent(name)) type = SymbolType.Component;
        symbols.push({ name, type, filePath, line: lineNum });
        return;
      }

      const typeMatch = typeRegex.exec(lineText);
      if (typeMatch) {
        symbols.push({ name: typeMatch[1], type: SymbolType.Type, filePath, line: lineNum });
        return;
      }

      const enumMatch = enumRegex.exec(lineText);
      if (enumMatch) {
        symbols.push({ name: enumMatch[1], type: SymbolType.Enum, filePath, line: lineNum });
        return;
      }
    });

    return symbols;
  }
}

export const symbolIndexer = new SymbolIndexer();

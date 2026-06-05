import { aliasResolver } from './aliasResolver';
import { ImportStatement } from './importTypes';

export class ImportResolver {
  public resolveMatch(symbol: string): ImportStatement {
    let source = 'react';
    if (symbol.startsWith('use')) {
      source = 'react';
    } else if (symbol.includes('Base')) {
      source = '@/core/base';
    } else {
      source = 'lodash';
    }

    return {
      source: aliasResolver.resolveAlias(source),
      specifiers: [symbol],
      kind: 'named'
    };
  }
}

export const importResolver = new ImportResolver();

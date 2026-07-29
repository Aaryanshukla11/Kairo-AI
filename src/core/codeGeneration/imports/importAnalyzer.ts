import { ImportStatement } from './importTypes';

export class ImportAnalyzer {
  public parseExisting(content: string): ImportStatement[] {
    const lines = content.split('\n');
    const statements: ImportStatement[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        // Extract basic name and source
        const match = line.match(/import\s+(?:({[^}]+})|([a-zA-Z0-9_]+))\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const specifiers = match[1]
            ? match[1].replace(/[{}]/g, '').split(',').map(s => s.trim())
            : [match[2].trim()];
          statements.push({
            source: match[3],
            specifiers,
            kind: 'named'
          });
        }
      }
    }

    return statements;
  }
}

export const importAnalyzer = new ImportAnalyzer();

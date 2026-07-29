import { ImportStatement } from './importTypes';

export class ImportOptimizer {
  public optimize(imports: ImportStatement[]): { optimized: ImportStatement[]; duplicates: string[] } {
    const optimizedMap = new Map<string, ImportStatement>();
    const duplicates: string[] = [];

    for (const imp of imports) {
      if (optimizedMap.has(imp.source)) {
        duplicates.push(imp.source);
        const existing = optimizedMap.get(imp.source)!;
        // Merge specifiers list
        const mergedSpecifiers = Array.from(new Set([...existing.specifiers, ...imp.specifiers]));
        optimizedMap.set(imp.source, {
          ...existing,
          specifiers: mergedSpecifiers
        });
      } else {
        optimizedMap.set(imp.source, { ...imp });
      }
    }

    return {
      optimized: Array.from(optimizedMap.values()),
      duplicates
    };
  }
}

export const importOptimizer = new ImportOptimizer();

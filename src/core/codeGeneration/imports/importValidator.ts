import { ImportStatement } from './importTypes';

export class ImportValidator {
  public validateImports(imports: ImportStatement[], targetFile: string): void {
    for (const imp of imports) {
      if (!imp.source || imp.source.trim() === '') {
        throw new Error('Import Resolution validation error: Broken import path source');
      }

      // Circular import check: check if the targetFile tries to import from itself
      if (imp.source.includes(targetFile) || targetFile.includes(imp.source)) {
        throw new Error(`Import Resolution validation error: Circular import detected in file "${targetFile}" referencing source "${imp.source}"`);
      }
    }
  }
}

export const importValidator = new ImportValidator();

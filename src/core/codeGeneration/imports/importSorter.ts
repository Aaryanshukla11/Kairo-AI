import { ImportStatement } from './importTypes';

export class ImportSorter {
  public sort(imports: ImportStatement[]): ImportStatement[] {
    return [...imports].sort((a, b) => {
      const aWeight = this.getSourceWeight(a.source);
      const bWeight = this.getSourceWeight(b.source);
      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }
      return a.source.localeCompare(b.source);
    });
  }

  private getSourceWeight(source: string): number {
    if (source.startsWith('node:') || ['fs', 'path', 'assert', 'os'].includes(source)) {
      return 1;
    }
    if (!source.startsWith('.') && !source.startsWith('@/')) {
      return 2;
    }
    if (source.startsWith('@/')) {
      return 3;
    }
    return 4;
  }
}

export const importSorter = new ImportSorter();

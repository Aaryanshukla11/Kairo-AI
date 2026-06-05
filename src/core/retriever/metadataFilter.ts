import { WorkspaceSymbol, IndexedFile } from '../indexer/indexTypes';

export class MetadataFilter {
  /**
   * Filters files based on target criteria.
   */
  public filterFiles(files: IndexedFile[], filters: Record<string, any>): IndexedFile[] {
    return files.filter(file => {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'language' && file.language !== value) return false;
      }
      return true;
    });
  }

  /**
   * Filters symbols based on target type tags.
   */
  public filterSymbols(symbols: WorkspaceSymbol[], filters: Record<string, any>): WorkspaceSymbol[] {
    return symbols.filter(sym => {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'type' && sym.type !== value) return false;
      }
      return true;
    });
  }
}

export const metadataFilter = new MetadataFilter();

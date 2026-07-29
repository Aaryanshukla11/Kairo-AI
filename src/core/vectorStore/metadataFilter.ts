import { VectorRecord } from './vectorStoreTypes';

export class MetadataFilter {
  /**
   * Checks key/value metadata matches against record collections.
   */
  public filter(records: VectorRecord[], filters: Record<string, any>): VectorRecord[] {
    return records.filter(record => {
      for (const [key, value] of Object.entries(filters)) {
        if (record.metadata[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }
}

export const metadataFilter = new MetadataFilter();

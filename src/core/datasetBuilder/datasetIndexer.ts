import { DatasetFileItem } from './datasetTypes';

export class DatasetIndexer {
  public buildIndex(files: DatasetFileItem[]): string[] {
    // Indexes file paths sorted alphabetically to ensure stable ordering
    return files.map(file => file.path).sort();
  }
}

export const datasetIndexer = new DatasetIndexer();

import { DatasetFileItem } from './datasetTypes';

export class DatasetOrganizer {
  public groupByLanguage(files: DatasetFileItem[]): Record<string, DatasetFileItem[]> {
    const groups: Record<string, DatasetFileItem[]> = {};
    for (const file of files) {
      const lang = file.language || 'Plain Text';
      if (!groups[lang]) {
        groups[lang] = [];
      }
      groups[lang].push(file);
    }
    return groups;
  }
}

export const datasetOrganizer = new DatasetOrganizer();

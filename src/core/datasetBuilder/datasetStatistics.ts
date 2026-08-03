import { DatasetFileItem, DatasetStatisticsModel } from './datasetTypes';

export class DatasetStatisticsCalculator {
  public calculate(files: DatasetFileItem[]): DatasetStatisticsModel {
    let totalBytes = 0;
    let totalTokens = 0;
    const distribution: Record<string, number> = {};

    for (const file of files) {
      totalBytes += file.sizeBytes;
      totalTokens += file.tokenEstimate;
      distribution[file.language] = (distribution[file.language] || 0) + 1;
    }

    return {
      totalBytes,
      totalTokens,
      averageFileSize: files.length > 0 ? parseFloat((totalBytes / files.length).toFixed(2)) : 0,
      languageDistribution: distribution
    };
  }
}

export const datasetStatisticsCalculator = new DatasetStatisticsCalculator();

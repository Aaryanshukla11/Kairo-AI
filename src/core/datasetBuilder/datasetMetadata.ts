import { DatasetFileItem } from './datasetTypes';

export class DatasetMetadataGenerator {
  public generate(files: DatasetFileItem[]): { languageDistribution: Record<string, number>; tokenEstimate: number } {
    const distribution: Record<string, number> = {};
    let totalTokens = 0;

    for (const file of files) {
      distribution[file.language] = (distribution[file.language] || 0) + 1;
      totalTokens += file.tokenEstimate;
    }

    return {
      languageDistribution: distribution,
      tokenEstimate: totalTokens
    };
  }
}

export const datasetMetadataGenerator = new DatasetMetadataGenerator();

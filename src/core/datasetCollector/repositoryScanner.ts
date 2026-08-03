import { CollectedFileItem, CollectionPolicy, RawFileInput } from './collectorTypes';
import { fileScanner } from './fileScanner';

export class RepositoryScanner {
  public scanRepository(
    datasetId: string,
    filesList: RawFileInput[],
    sourceType: string,
    policy?: CollectionPolicy
  ): CollectedFileItem[] {
    const results: CollectedFileItem[] = [];

    for (const rawFile of filesList) {
      if (!rawFile || !rawFile.path) {
        continue;
      }

      // Check file policy limits if defined
      if (policy) {
        const ext = rawFile.path.split('.').pop()?.toLowerCase();
        if (policy.allowedExtensions && policy.allowedExtensions.length > 0) {
          if (ext && !policy.allowedExtensions.map(e => e.toLowerCase().replace(/^\./, '')).includes(ext)) {
            continue;
          }
        }
        if (policy.ignoredExtensions && policy.ignoredExtensions.length > 0) {
          if (ext && policy.ignoredExtensions.map(e => e.toLowerCase().replace(/^\./, '')).includes(ext)) {
            continue;
          }
        }
        if (policy.maxFileSizeBytes && rawFile.content.length > policy.maxFileSizeBytes) {
          continue;
        }
      }

      const item = fileScanner.scanFile(datasetId, rawFile, sourceType);
      results.push(item);
    }

    return results;
  }
}

export const repositoryScanner = new RepositoryScanner();

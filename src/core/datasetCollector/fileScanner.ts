import { CollectedFileItem, RawFileInput } from './collectorTypes';
import { licenseDetector } from './licenseDetector';
import { provenanceTracker } from './provenanceTracker';

export class FileScanner {
  public scanFile(
    datasetId: string,
    rawInput: RawFileInput,
    sourceType: string
  ): CollectedFileItem {
    const filePath = rawInput.path;
    const content = rawInput.content || '';
    const license = licenseDetector.detectLicense(content);
    const checksum = provenanceTracker.computeChecksum(content);
    const language = rawInput.language || provenanceTracker.inferLanguageFromPath(filePath);

    const provenance = provenanceTracker.generateProvenance(
      datasetId,
      sourceType,
      filePath,
      language,
      license,
      checksum,
      {
        repository: rawInput.repository,
        repositoryUrl: rawInput.repositoryUrl,
        commitHash: rawInput.commitHash,
        branch: rawInput.branch
      }
    );

    const ext = filePath.split('.').pop() || '';

    return {
      filePath,
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
      provenance,
      fileExtension: ext
    };
  }
}

export const fileScanner = new FileScanner();

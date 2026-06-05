import { CollectedFileItem, CollectorManifestModel } from './collectorTypes';

export class CollectorManifest {
  public createManifest(
    datasetId: string,
    totalFiles: number,
    totalBytes: number,
    licenses: Record<string, number>,
    languages: Record<string, number>,
    sourceSummary?: Record<string, number>,
    files?: CollectedFileItem[],
    integrityStatus: 'valid' | 'invalid' = 'valid'
  ): CollectorManifestModel {
    const checksumsMap: Record<string, string> = {};
    if (files) {
      for (const file of files) {
        if (file.filePath && file.provenance?.checksum) {
          checksumsMap[file.filePath] = file.provenance.checksum;
        }
      }
    }

    return {
      manifestId: `COL-MAN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      datasetId,
      collectionTime: Date.now(),
      totalFiles,
      totalBytes,
      licensesDistribution: licenses,
      languagesDistribution: languages,
      sourceSummary: sourceSummary || {},
      checksums: checksumsMap,
      integrityStatus,
      version: '1.0.0'
    };
  }
}

export const collectorManifest = new CollectorManifest();

import { ProvenanceModel } from '../datasetCollector/collectorTypes';

export class MetadataNormalizer {
  public normalizeMetadata(provenance: ProvenanceModel): { normalized: ProvenanceModel; isModified: boolean } {
    if (!provenance) {
      return { normalized: {} as any, isModified: false };
    }

    const original = JSON.stringify(provenance);
    const normalized = { ...provenance };

    // 1. Trim metadata fields
    if (normalized.sampleId) normalized.sampleId = normalized.sampleId.trim();
    if (normalized.datasetId) normalized.datasetId = normalized.datasetId.trim();
    if (normalized.repository) normalized.repository = normalized.repository.trim();
    if (normalized.repositoryUrl) normalized.repositoryUrl = normalized.repositoryUrl.trim();
    if (normalized.commitHash) normalized.commitHash = normalized.commitHash.trim();
    if (normalized.branch) normalized.branch = normalized.branch.trim();
    
    // 2. Normalize file paths to forward-slashes
    if (normalized.filePath) {
      normalized.filePath = normalized.filePath.trim().replace(/\\/g, '/');
    }

    // 3. Fallbacks
    if (!normalized.branch) {
      normalized.branch = 'main';
    }
    if (!normalized.commitHash) {
      normalized.commitHash = 'HEAD';
    }
    if (!normalized.license) {
      normalized.license = 'Unknown';
    }

    const isModified = JSON.stringify(normalized) !== original;

    return {
      normalized,
      isModified
    };
  }
}

export const metadataNormalizer = new MetadataNormalizer();

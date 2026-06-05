import { DatasetVersionModel, DatasetSnapshotModel, VersionManifestModel } from './versionTypes';
import { lineageTracker } from './lineageTracker';

export class VersionValidator {
  public validateLineageIntegrity(version: DatasetVersionModel): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (version.parentVersion) {
      const parent = lineageTracker.getLineage(version.datasetId, version.parentVersion);
      if (!parent) {
        errors.push(`Lineage Integrity Error: Parent version ${version.parentVersion} is not registered in the lineage graph.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateSnapshotConsistency(
    snapshot: DatasetSnapshotModel,
    manifest: VersionManifestModel
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (snapshot.checksum !== manifest.checksum) {
      errors.push(`Snapshot Consistency Error: Snapshot checksum ${snapshot.checksum} does not match manifest checksum ${manifest.checksum}.`);
    }

    if (snapshot.samples.length !== manifest.sampleCount) {
      errors.push(`Snapshot Consistency Error: Snapshot samples count (${snapshot.samples.length}) does not match manifest sampleCount (${manifest.sampleCount}).`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateManifest(manifest: VersionManifestModel): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.manifestId) errors.push('Manifest ID is missing.');
    if (!manifest.datasetId) errors.push('Dataset ID is missing.');
    if (!manifest.version) errors.push('Version string is missing.');
    if (!manifest.checksum) errors.push('Manifest checksum is missing.');
    if (manifest.sampleCount < 0) errors.push('Invalid sample count.');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const versionValidator = new VersionValidator();
export default versionValidator;

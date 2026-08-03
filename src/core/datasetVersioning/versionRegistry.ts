import { DatasetVersionModel } from './versionTypes';
import { metadataProvider } from './providers/metadataProvider';

export class VersionRegistry {
  private activeVersions: string[] = [];

  public registerVersion(versionModel: DatasetVersionModel): void {
    const key = `${versionModel.datasetId}:${versionModel.version}`;

    // Ensure immutability: check if version already exists
    if (metadataProvider.getMetadata(versionModel.datasetId, versionModel.version)) {
      throw new Error(`Versioning Error: Version ${versionModel.version} of dataset ${versionModel.datasetId} already exists and is immutable.`);
    }

    metadataProvider.saveMetadata(versionModel);
    this.activeVersions.push(key);
  }

  public getVersion(datasetId: string, version: string): DatasetVersionModel | undefined {
    return metadataProvider.getMetadata(datasetId, version);
  }

  public listVersions(datasetId: string): DatasetVersionModel[] {
    // Collect all loaded version details matching datasetId
    const results: DatasetVersionModel[] = [];
    for (const key of this.activeVersions) {
      if (key.startsWith(`${datasetId}:`)) {
        const parts = key.split(':');
        const ver = parts.slice(1).join(':');
        const meta = metadataProvider.getMetadata(datasetId, ver);
        if (meta) {
          results.push(meta);
        }
      }
    }
    return results;
  }

  public clear(): void {
    metadataProvider.clear();
    this.activeVersions = [];
  }
}

export const versionRegistry = new VersionRegistry();
export default versionRegistry;

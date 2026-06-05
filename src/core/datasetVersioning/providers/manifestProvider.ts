import { VersionManifestModel } from '../versionTypes';

export class ManifestProvider {
  private manifests = new Map<string, VersionManifestModel>();

  public saveManifest(manifest: VersionManifestModel): void {
    this.manifests.set(`${manifest.datasetId}:${manifest.version}`, manifest);
  }

  public getManifest(datasetId: string, version: string): VersionManifestModel | undefined {
    return this.manifests.get(`${datasetId}:${version}`);
  }

  public clear(): void {
    this.manifests.clear();
  }
}

export const manifestProvider = new ManifestProvider();
export default manifestProvider;

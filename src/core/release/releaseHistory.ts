import { ReleaseManifestModel } from './releaseTypes';

export class ReleaseHistory {
  private history = new Map<string, ReleaseManifestModel>();

  public saveRelease(manifest: ReleaseManifestModel): void {
    this.history.set(manifest.version, { ...manifest });
  }

  public getRelease(version: string): ReleaseManifestModel | undefined {
    return this.history.get(version);
  }

  public listReleases(): ReleaseManifestModel[] {
    return Array.from(this.history.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public clear(): void {
    this.history.clear();
  }
}

export const releaseHistory = new ReleaseHistory();

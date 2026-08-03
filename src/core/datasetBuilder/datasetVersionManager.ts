export class DatasetVersionManager {
  private versions = new Map<string, string[]>(); // Map datasetId -> versions list

  public registerVersion(datasetId: string, version: string): void {
    if (!this.versions.has(datasetId)) {
      this.versions.set(datasetId, []);
    }
    const list = this.versions.get(datasetId)!;
    if (!list.includes(version)) {
      list.push(version);
    }
  }

  public getVersions(datasetId: string): string[] {
    return this.versions.get(datasetId) || [];
  }
}

export const datasetVersionManager = new DatasetVersionManager();

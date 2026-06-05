import { DatasetVersionModel } from '../versionTypes';

export class MetadataProvider {
  private metadataRegistry = new Map<string, DatasetVersionModel>();

  public saveMetadata(meta: DatasetVersionModel): void {
    this.metadataRegistry.set(`${meta.datasetId}:${meta.version}`, meta);
  }

  public getMetadata(datasetId: string, version: string): DatasetVersionModel | undefined {
    return this.metadataRegistry.get(`${datasetId}:${version}`);
  }

  public clear(): void {
    this.metadataRegistry.clear();
  }
}

export const metadataProvider = new MetadataProvider();
export default metadataProvider;

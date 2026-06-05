import { CollectedFileItem, CollectorManifestModel, CollectionReport } from './collectorTypes';

export interface StoredDatasetCollection {
  datasetId: string;
  files: CollectedFileItem[];
  manifest?: CollectorManifestModel;
  report?: CollectionReport;
  collectedAt: number;
}

export class CollectionManager {
  private collections = new Map<string, StoredDatasetCollection>();

  public saveCollection(
    datasetId: string,
    files: CollectedFileItem[],
    manifest?: CollectorManifestModel,
    report?: CollectionReport
  ): void {
    this.collections.set(datasetId, {
      datasetId,
      files,
      manifest,
      report,
      collectedAt: Date.now()
    });
  }

  public getCollection(datasetId: string): CollectedFileItem[] | undefined {
    return this.collections.get(datasetId)?.files;
  }

  public getStoredDataset(datasetId: string): StoredDatasetCollection | undefined {
    return this.collections.get(datasetId);
  }

  public listDatasets(): string[] {
    return Array.from(this.collections.keys());
  }

  public deleteCollection(datasetId: string): boolean {
    return this.collections.delete(datasetId);
  }

  public clear(): void {
    this.collections.clear();
  }
}

export const collectionManager = new CollectionManager();

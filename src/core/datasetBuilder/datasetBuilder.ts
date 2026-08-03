import { datasetEngine } from './datasetEngine';
import { datasetVersionManager } from './datasetVersionManager';
import { datasetEvents } from './datasetEvents';
import { DatasetFileItem, DatasetModel, DatasetValidationReport } from './datasetTypes';

export class DatasetBuilder {
  public async createDataset(
    datasetId: string,
    name: string,
    version: string,
    source: string,
    files: DatasetFileItem[],
    desc: string
  ): Promise<{ dataset: DatasetModel; validation: DatasetValidationReport }> {
    return datasetEngine.build(datasetId, name, version, source, files, desc);
  }

  public getVersions(datasetId: string): string[] {
    return datasetVersionManager.getVersions(datasetId);
  }

  public subscribe(listener: any): () => void {
    return datasetEvents.subscribe(listener);
  }
}

export const datasetBuilder = new DatasetBuilder();

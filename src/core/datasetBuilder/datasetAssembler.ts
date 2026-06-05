import { DatasetModel, DatasetFileItem, DatasetManifestModel } from './datasetTypes';
import { datasetIndexer } from './datasetIndexer';

export class DatasetAssembler {
  public assemble(
    files: DatasetFileItem[],
    manifest: DatasetManifestModel
  ): DatasetModel {
    const index = datasetIndexer.buildIndex(files);
    return {
      manifest,
      files,
      index
    };
  }
}

export const datasetAssembler = new DatasetAssembler();

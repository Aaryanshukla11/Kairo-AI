import { DatasetManifestModel } from './datasetTypes';

export class DatasetManifestCompiler {
  public compile(
    datasetId: string,
    name: string,
    version: string,
    source: string,
    languages: Record<string, number>,
    fileCount: number,
    tokens: number,
    desc: string
  ): DatasetManifestModel {
    return {
      datasetId,
      name,
      version,
      creationDate: Date.now(),
      source,
      languageDistribution: languages,
      fileCount,
      tokenEstimate: tokens,
      license: 'MIT',
      checksum: `sha256-chk-${Date.now()}`,
      tags: ['local', 'dataset-builder'],
      description: desc
    };
  }
}

export const datasetManifestCompiler = new DatasetManifestCompiler();

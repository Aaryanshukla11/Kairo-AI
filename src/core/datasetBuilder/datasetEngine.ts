import { DatasetModel, DatasetFileItem, DatasetBuilderEventType, DatasetValidationReport } from './datasetTypes';
import { datasetManifestCompiler } from './datasetManifest';
import { datasetMetadataGenerator } from './datasetMetadata';
import { datasetValidator } from './datasetValidator';
import { datasetAssembler } from './datasetAssembler';
import { datasetVersionManager } from './datasetVersionManager';
import { datasetEvents } from './datasetEvents';
import { datasetMetricsTracker } from './datasetMetrics';

export class DatasetEngine {
  public async build(
    datasetId: string,
    name: string,
    version: string,
    source: string,
    files: DatasetFileItem[],
    desc: string
  ): Promise<{ dataset: DatasetModel; validation: DatasetValidationReport }> {
    datasetEvents.emit(DatasetBuilderEventType.SourcesDiscovered);

    // Extract
    datasetEvents.emit(DatasetBuilderEventType.FilesExtracted, { count: files.length });

    // Metadata
    const meta = datasetMetadataGenerator.generate(files);
    datasetEvents.emit(DatasetBuilderEventType.MetadataGenerated);

    // Manifest
    const manifest = datasetManifestCompiler.compile(
      datasetId,
      name,
      version,
      source,
      meta.languageDistribution,
      files.length,
      meta.tokenEstimate,
      desc
    );
    datasetEvents.emit(DatasetBuilderEventType.ManifestGenerated);

    // Validate
    const validation = datasetValidator.validate(files, manifest);
    datasetEvents.emit(DatasetBuilderEventType.ContentValidated);

    // Version
    datasetVersionManager.registerVersion(datasetId, version);
    datasetEvents.emit(DatasetBuilderEventType.DatasetVersioned);

    // Assemble
    const dataset = datasetAssembler.assemble(files, manifest);
    datasetEvents.emit(DatasetBuilderEventType.DatasetBuilt);

    datasetMetricsTracker.logBuild();

    return {
      dataset,
      validation
    };
  }
}

export const datasetEngine = new DatasetEngine();

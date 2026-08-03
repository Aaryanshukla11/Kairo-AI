import {
  CollectedFileItem,
  CollectorManifestModel,
  CollectorEventType,
  CollectionStatisticsModel,
  CollectionPolicy,
  CollectionReport,
  RawFileInput
} from './collectorTypes';
import { sourceDiscovery } from './sourceDiscovery';
import { repositoryScanner } from './repositoryScanner';
import { metadataCollector } from './metadataCollector';
import { integrityValidator } from './integrityValidator';
import { collectorManifest } from './collectorManifest';
import { collectionManager } from './collectionManager';
import { collectorEvents } from './collectorEvents';
import { collectorMetricsTracker } from './collectorMetrics';

export class CollectorEngine {
  public async collect(
    datasetId: string,
    sourcePaths: string[],
    rawFiles: RawFileInput[],
    sourceType: string,
    policy?: CollectionPolicy
  ): Promise<CollectionReport> {
    const startTime = Date.now();

    // 1. Discover Sources
    collectorEvents.emit(CollectorEventType.SourceDiscovered, { sourcePaths });
    const discoveredSources = sourceDiscovery.discover(sourcePaths);
    const sourceReport = sourceDiscovery.generateSourceReport(discoveredSources);

    // 2. Validate Source
    collectorEvents.emit(CollectorEventType.SourceValidated, { sourceReport });

    // 3. Scan Files
    const files: CollectedFileItem[] = repositoryScanner.scanRepository(datasetId, rawFiles, sourceType, policy);
    collectorEvents.emit(CollectorEventType.FilesScanned, { count: files.length });

    // 4. Extract Metadata
    const meta = metadataCollector.collectMetadata(files);
    collectorEvents.emit(CollectorEventType.MetadataExtracted, { meta });

    // 5. Detect License
    const licenseReport = metadataCollector.generateLicenseReport(files);
    collectorEvents.emit(CollectorEventType.LicenseDetected, { licenseReport });

    // 6. Generate Provenance
    collectorEvents.emit(CollectorEventType.ProvenanceGenerated, { count: files.length });

    // 7. Validate Integrity
    const integrityReport = integrityValidator.validate(files);
    collectorEvents.emit(CollectorEventType.IntegrityValidated, { integrityReport });

    if (!integrityReport.isValid) {
      const errorMsg = `Collection error: Integrity check failed. ${integrityReport.errors.join(', ')}`;
      collectorMetricsTracker.addLog(errorMsg, datasetId);
      throw new Error(errorMsg);
    }

    // 8. Create Manifest
    const totalBytes = meta.totalBytes;
    const manifest: CollectorManifestModel = collectorManifest.createManifest(
      datasetId,
      files.length,
      totalBytes,
      meta.licensesDistribution,
      meta.languagesDistribution,
      meta.sourceSummary,
      files,
      integrityReport.isValid ? 'valid' : 'invalid'
    );
    collectorEvents.emit(CollectorEventType.ManifestCreated, { manifest });

    // 9. Statistics & Report
    const durationMs = Date.now() - startTime;
    const stats: CollectionStatisticsModel = {
      activeSourcesCount: discoveredSources.length,
      collectedFilesCount: files.length,
      totalBytes,
      licensesDistribution: meta.licensesDistribution,
      languagesDistribution: meta.languagesDistribution,
      sourceDistribution: meta.sourceSummary,
      integrityStatus: integrityReport.isValid ? 'valid' : 'invalid',
      durationMs
    };

    const fullReport: CollectionReport = {
      datasetId,
      timestamp: Date.now(),
      sourceReport,
      licenseReport,
      integrityReport,
      statistics: stats,
      manifest
    };

    // Save & Log
    collectionManager.saveCollection(datasetId, files, manifest, fullReport);
    collectorMetricsTracker.logCollection(files.length, totalBytes, datasetId);

    // 10. Publish Report
    collectorEvents.emit(CollectorEventType.ReportPublished, { report: fullReport });

    return fullReport;
  }
}

export const collectorEngine = new CollectorEngine();

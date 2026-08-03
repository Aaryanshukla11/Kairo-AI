import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import {
  Fingerprint,
  DuplicateCluster,
  DeduplicationConfig,
  DeduplicationReportModel,
  DeduplicationEventType
} from './deduplicationTypes';
import { duplicateDetector } from './duplicateDetector';
import { duplicateHistory } from './duplicateHistory';
import { deduplicationValidator } from './deduplicationValidator';
import { deduplicationMetrics } from './deduplicationMetrics';
import { deduplicationEvents } from './deduplicationEvents';

export class DeduplicationEngine {
  private defaultConfig: DeduplicationConfig = {
    exactMatchThreshold: 1.0,
    structuralThreshold: 0.90,
    semanticThreshold: 0.85
  };

  public deduplicate(
    datasetId: string,
    samples: CleanedSample[],
    customConfig?: Partial<DeduplicationConfig>
  ): {
    runId: string;
    deduplicatedDataset: CleanedSample[];
    clusters: DuplicateCluster[];
    report: DeduplicationReportModel;
  } {
    const runId = `DEDUP-RUN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const config = { ...this.defaultConfig, ...customConfig };

    duplicateHistory.logHistory(datasetId, runId, `Starting deduplication run on ${samples.length} samples.`);
    deduplicationEvents.emit(DeduplicationEventType.DeduplicationStarted, { datasetId, runId });

    // 1. Generate Fingerprints & Match Pairs
    const scanResult = duplicateDetector.detectDuplicates(samples, config);
    deduplicationEvents.emit(DeduplicationEventType.FingerprintsGenerated, { count: scanResult.fingerprints.size });
    deduplicationEvents.emit(DeduplicationEventType.ExactMatchingCompleted, { count: scanResult.exactCount });
    deduplicationEvents.emit(DeduplicationEventType.StructuralAnalysisCompleted, { count: scanResult.structCount });
    deduplicationEvents.emit(DeduplicationEventType.SemanticSimilarityCompleted, { count: scanResult.semanticCount });
    deduplicationEvents.emit(DeduplicationEventType.ClustersFormed, { count: scanResult.clusters.length });

    // 2. Validate Clusters & Build Clean Output
    const duplicatesToRemove = new Set<string>();
    let spaceSaved = 0;

    for (const cluster of scanResult.clusters) {
      // Validate cluster
      const validation = deduplicationValidator.validateClusterIntegrity(cluster);
      if (!validation.isValid) {
        duplicateHistory.logHistory(
          datasetId,
          runId,
          `Warning: Cluster validation warnings in cluster ${cluster.clusterId}: ${validation.errors.join(', ')}`
        );
      }

      // Add duplicate sampleIDs to remove set
      for (const dup of cluster.duplicateSamples) {
        duplicatesToRemove.add(dup.provenance?.sampleId || dup.filePath);
        spaceSaved += dup.cleanedSizeBytes || 0;
      }
    }

    // Build deduplicated list (only keep representative samples or non-duplicates)
    const deduplicatedDataset = samples.filter(
      sample => !duplicatesToRemove.has(sample.provenance?.sampleId || sample.filePath)
    );

    deduplicationEvents.emit(DeduplicationEventType.DuplicatesResolved, {
      representativeCount: scanResult.clusters.length,
      removedCount: duplicatesToRemove.size
    });

    // Compute Metrics & Report
    deduplicationMetrics.logDeduplicationRun(samples.length, duplicatesToRemove.size, spaceSaved);
    
    const report: DeduplicationReportModel = {
      runId,
      datasetId,
      timestamp: Date.now(),
      totalInputSamples: samples.length,
      deduplicatedCount: deduplicatedDataset.length,
      duplicatesFound: duplicatesToRemove.size,
      spaceSavedBytes: spaceSaved,
      clustersCount: scanResult.clusters.length,
      exactDuplicatesCount: scanResult.exactCount,
      structuralDuplicatesCount: scanResult.structCount,
      semanticDuplicatesCount: scanResult.semanticCount
    };

    duplicateHistory.logHistory(
      datasetId,
      runId,
      `Completed run. Deduplicated from ${samples.length} to ${deduplicatedDataset.length}. Space saved: ${spaceSaved} bytes.`
    );
    
    deduplicationEvents.emit(DeduplicationEventType.DeduplicationCompleted, { runId, report });

    return {
      runId,
      deduplicatedDataset,
      clusters: scanResult.clusters,
      report
    };
  }
}

export const deduplicationEngine = new DeduplicationEngine();
export default deduplicationEngine;

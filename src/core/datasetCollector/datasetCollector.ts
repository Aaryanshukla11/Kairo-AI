import { collectorEngine } from './collectorEngine';
import { collectionManager } from './collectionManager';
import { collectorEvents } from './collectorEvents';
import { collectorMetricsTracker } from './collectorMetrics';
import {
  CollectedFileItem,
  CollectorManifestModel,
  CollectionStatisticsModel,
  CollectionReport,
  CollectionPolicy,
  CollectorEventListener,
  RawFileInput
} from './collectorTypes';

export class DatasetCollector {
  public async collectDataset(
    datasetId: string,
    sourcePaths: string[],
    rawFiles: RawFileInput[],
    sourceType: string,
    policy?: CollectionPolicy
  ): Promise<{ files: CollectedFileItem[]; manifest: CollectorManifestModel; stats: CollectionStatisticsModel; report: CollectionReport }> {
    const report = await collectorEngine.collect(datasetId, sourcePaths, rawFiles, sourceType, policy);
    const files = collectionManager.getCollection(datasetId) || [];
    return {
      files,
      manifest: report.manifest,
      stats: report.statistics,
      report
    };
  }

  public getCollection(datasetId: string): CollectedFileItem[] | undefined {
    return collectionManager.getCollection(datasetId);
  }

  public getStoredDataset(datasetId: string) {
    return collectionManager.getStoredDataset(datasetId);
  }

  public listDatasets(): string[] {
    return collectionManager.listDatasets();
  }

  public getMetrics() {
    return collectorMetricsTracker.getStats();
  }

  public getHistoryLogs() {
    return collectorMetricsTracker.getHistoryLogs();
  }

  public subscribe(listener: CollectorEventListener): () => void {
    return collectorEvents.subscribe(listener);
  }
}

export const datasetCollector = new DatasetCollector();

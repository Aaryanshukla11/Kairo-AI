import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { versionEngine } from './versionEngine';
import { versionRegistry } from './versionRegistry';
import { versionComparator } from './versionComparator';
import { versionHistory } from './versionHistory';
import { versionMetrics } from './versionMetrics';
import { lineageTracker } from './lineageTracker';
import { versionEvents } from './versionEvents';
import {
  DatasetVersionModel,
  DatasetSnapshotModel,
  VersionManifestModel,
  VersionEventListener,
  VersionComparisonModel
} from './versionTypes';

export class DatasetVersionManager {
  public registerNewVersion(
    datasetId: string,
    version: string,
    samples: CleanedSample[],
    parentVersion?: string,
    derivedFrom?: string,
    transformations: string[] = []
  ): {
    versionModel: DatasetVersionModel;
    snapshot: DatasetSnapshotModel;
    manifest: VersionManifestModel;
  } {
    return versionEngine.createVersion(
      datasetId,
      version,
      samples,
      parentVersion,
      derivedFrom,
      transformations
    );
  }

  public getVersionDetails(datasetId: string, version: string): DatasetVersionModel | undefined {
    return versionRegistry.getVersion(datasetId, version);
  }

  public listDatasetVersions(datasetId: string): DatasetVersionModel[] {
    return versionRegistry.listVersions(datasetId);
  }

  public getLineageNode(datasetId: string, version: string) {
    return lineageTracker.getLineage(datasetId, version);
  }

  public getLineageGraph(datasetId: string) {
    return lineageTracker.getLineageGraph(datasetId);
  }

  public compareVersions(v1: DatasetVersionModel, v2: DatasetVersionModel): VersionComparisonModel {
    return versionComparator.compareVersions(v1, v2);
  }

  public getHistoryLogs() {
    return versionHistory.getHistory();
  }

  public getMetricsSummary() {
    return versionMetrics.getSummary();
  }

  public subscribe(listener: VersionEventListener): () => void {
    return versionEvents.subscribe(listener);
  }

  public clearHistory(): void {
    versionHistory.clear();
    versionMetrics.clear();
    versionRegistry.clear();
    lineageTracker.clear();
  }
}

export const datasetVersionManager = new DatasetVersionManager();
export default datasetVersionManager;

import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { deduplicationEngine } from './deduplicationEngine';
import { deduplicationEvents } from './deduplicationEvents';
import { duplicateHistory } from './duplicateHistory';
import { deduplicationMetrics } from './deduplicationMetrics';
import {
  DuplicateCluster,
  DeduplicationConfig,
  DeduplicationReportModel,
  DeduplicationEventListener
} from './deduplicationTypes';

export class DatasetDeduplicationEngine {
  private activeDeduplications = new Map<string, {
    deduplicatedDataset: CleanedSample[];
    clusters: DuplicateCluster[];
    report: DeduplicationReportModel;
  }>();

  public deduplicateDataset(
    datasetId: string,
    samples: CleanedSample[],
    config?: Partial<DeduplicationConfig>
  ): {
    runId: string;
    deduplicatedDataset: CleanedSample[];
    clusters: DuplicateCluster[];
    report: DeduplicationReportModel;
  } {
    const result = deduplicationEngine.deduplicate(datasetId, samples, config);
    this.activeDeduplications.set(result.runId, {
      deduplicatedDataset: result.deduplicatedDataset,
      clusters: result.clusters,
      report: result.report
    });
    return result;
  }

  public getDeduplicationRun(runId: string) {
    return this.activeDeduplications.get(runId);
  }

  public getHistoryLogs() {
    return duplicateHistory.getHistory();
  }

  public getMetricsSummary() {
    return deduplicationMetrics.getSummary();
  }

  public subscribe(listener: DeduplicationEventListener): () => void {
    return deduplicationEvents.subscribe(listener);
  }

  public clearHistory(): void {
    duplicateHistory.clear();
    deduplicationMetrics.clear();
    this.activeDeduplications.clear();
  }
}

export const datasetDeduplicationEngine = new DatasetDeduplicationEngine();
export default datasetDeduplicationEngine;

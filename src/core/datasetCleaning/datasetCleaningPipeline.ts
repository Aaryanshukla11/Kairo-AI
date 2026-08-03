import { CollectedFileItem } from '../datasetCollector/collectorTypes';
import { cleaningEngine } from './cleaningEngine';
import { cleaningEvents } from './cleaningEvents';
import { cleaningHistory } from './cleaningHistory';
import { CleanedSample, RejectedSample, CleaningReportModel, CleaningRulesConfig, CleaningEventListener } from './cleaningTypes';

export class DatasetCleaningPipeline {
  private activePipelineRuns = new Map<string, {
    cleanedSamples: CleanedSample[];
    rejectedSamples: RejectedSample[];
    report: CleaningReportModel;
  }>();

  public async cleanDataset(
    datasetId: string,
    collectedDataset: CollectedFileItem[],
    config?: Partial<CleaningRulesConfig>
  ): Promise<{ runId: string; cleanedSamples: CleanedSample[]; rejectedSamples: RejectedSample[]; report: CleaningReportModel }> {
    const result = await cleaningEngine.clean(datasetId, collectedDataset, config);
    this.activePipelineRuns.set(result.runId, {
      cleanedSamples: result.cleanedSamples,
      rejectedSamples: result.rejectedSamples,
      report: result.report
    });
    return result;
  }

  public getPipelineRun(runId: string) {
    return this.activePipelineRuns.get(runId);
  }

  public getHistoryLogs() {
    return cleaningHistory.getHistory();
  }

  public subscribe(listener: CleaningEventListener): () => void {
    return cleaningEvents.subscribe(listener);
  }

  public clearHistory(): void {
    cleaningHistory.clear();
    this.activePipelineRuns.clear();
  }
}

export const datasetCleaningPipeline = new DatasetCleaningPipeline();
export default datasetCleaningPipeline;

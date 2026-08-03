import {
  ExperimentModel,
  ExperimentManifestModel,
  ReplayReportModel,
  ExperimentMetricsModel,
  ExperimentEventListener
} from './experimentTypes';
import { experimentEngine } from './experimentEngine';
import { experimentRegistry } from './experimentRegistry';
import { experimentHistory } from './experimentHistory';
import { experimentMetrics } from './experimentMetrics';
import { experimentEvents } from './experimentEvents';
import { experimentArtifacts } from './experimentArtifacts';
import { experimentComparator, ExperimentComparisonReport } from './experimentComparator';

export class ExperimentTracker {
  public async createExperiment(
    version: string,
    experimentType: string,
    trainingConfiguration: any,
    datasetVersion: string,
    tokenizerVersion: string,
    checkpointVersion: string | undefined,
    hardwareProfile: any,
    randomSeed: number,
    evaluationResults: any,
    overridesMetrics: Partial<ExperimentMetricsModel> = {},
    artifactsList: string[] = []
  ): Promise<{
    experiment: ExperimentModel;
    manifest: ExperimentManifestModel;
    replayReport: ReplayReportModel;
  }> {
    return experimentEngine.createAndTrack(
      version,
      experimentType,
      trainingConfiguration,
      datasetVersion,
      tokenizerVersion,
      checkpointVersion,
      hardwareProfile,
      randomSeed,
      evaluationResults,
      overridesMetrics,
      artifactsList
    );
  }

  public getExperimentDetails(experimentId: string): ExperimentModel | undefined {
    return experimentRegistry.get(experimentId);
  }

  public listExperiments(): ExperimentModel[] {
    return experimentRegistry.list();
  }

  public getArtifactsList(experimentId: string): string[] {
    return experimentArtifacts.getArtifacts(experimentId);
  }

  public compareExperiments(e1: ExperimentModel, e2: ExperimentModel): ExperimentComparisonReport {
    return experimentComparator.compare(e1, e2);
  }

  public getHistoryLogs() {
    return experimentHistory.getHistory();
  }

  public getMetricsSummary() {
    return experimentMetrics.getSummary();
  }

  public subscribe(listener: ExperimentEventListener): () => void {
    return experimentEvents.subscribe(listener);
  }

  public clearHistory(): void {
    experimentRegistry.clear();
    experimentHistory.clear();
    experimentMetrics.clear();
    experimentEvents.clear();
    experimentArtifacts.clear();
  }
}

export const experimentTracker = new ExperimentTracker();
export default experimentTracker;

import {
  ExperimentModel,
  ExperimentManifestModel,
  ReplayReportModel,
  ExperimentEventType,
  ExperimentMetricsModel
} from './experimentTypes';
import { experimentBuilder } from './experimentBuilder';
import { experimentValidator } from './experimentValidator';
import { experimentArtifacts } from './experimentArtifacts';
import { experimentManifest } from './experimentManifest';
import { experimentRegistry } from './experimentRegistry';
import { experimentHistory } from './experimentHistory';
import { experimentReplay } from './experimentReplay';
import { experimentReports } from './experimentReports';
import { experimentMetrics } from './experimentMetrics';
import { experimentEvents } from './experimentEvents';

export class ExperimentEngine {
  public async createAndTrack(
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
    
    // 1. Create Experiment (Resolves metrics)
    const experiment = experimentBuilder.buildExperiment(
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
    experimentEvents.emit(ExperimentEventType.ExperimentCreated, { experimentId: experiment.experimentId });

    // 2. Validate parameters
    const validation = experimentValidator.validate(experiment);
    if (!validation.isValid) {
      throw new Error(`Experiment Validation Error: ${validation.errors.join(', ')}`);
    }

    // 3. Register Artifacts
    experimentArtifacts.registerArtifacts(experiment.experimentId, artifactsList);
    experimentEvents.emit(ExperimentEventType.ArtifactsRegistered);

    // 4. Track Metrics
    experimentMetrics.logRun();
    experimentEvents.emit(ExperimentEventType.MetricsTracked, { metrics: experiment.metrics });

    // 5. Record Events
    experimentEvents.emit(ExperimentEventType.EventsRecorded);

    // 6. Generate Reports
    const repStr = experimentReports.compileReport(experiment);
    experimentEvents.emit(ExperimentEventType.ReportsGenerated);

    // 7. Store History log
    experimentRegistry.register(experiment);
    experimentHistory.logAction(experiment.experimentId, `Saved experiment run v${version}.`);
    experimentEvents.emit(ExperimentEventType.HistoryStored);

    // 8. Enable Replay
    const replayReport = experimentReplay.generateReplayReport(experiment, randomSeed, hardwareProfile);
    experimentEvents.emit(ExperimentEventType.ReplayEnabled);

    return {
      experiment,
      manifest: experimentManifest.createManifest(experiment),
      replayReport
    };
  }
}

export const experimentEngine = new ExperimentEngine();
export default experimentEngine;

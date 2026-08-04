import {
  TrainingSessionModel,
  TrainingReportModel,
  TrainingManifestModel,
  TrainingEventListener
} from './trainingTypes';
import { trainingCoordinator } from './trainingCoordinator';
import { trainingSession } from './trainingSession';
import { trainingLifecycle } from './trainingLifecycle';
import { trainingHistory } from './trainingHistory';
import { trainingMetrics } from './trainingMetrics';
import { trainingEvents } from './trainingEvents';
import { trainingLoop } from './trainingLoop';

export class TrainingEngine {
  public async executeTraining(
    datasetVersion: string,
    tokenizerVersion: string,
    config: any,
    checkpoint: any,
    hardware: any,
    framework: string,
    totalEpochs = 3,
    totalSteps = 30,
    onStepCallback?: (metrics: any) => void
  ): Promise<{
    session: TrainingSessionModel;
    manifest: TrainingManifestModel;
    report: TrainingReportModel;
  }> {
    return trainingCoordinator.execute(
      datasetVersion,
      tokenizerVersion,
      config,
      checkpoint,
      hardware,
      framework,
      totalEpochs,
      totalSteps,
      onStepCallback
    );
  }

  public getSessionDetails(): TrainingSessionModel | undefined {
    return trainingSession.getSession();
  }

  public interruptTraining(): void {
    trainingLoop.requestInterruption();
    trainingLifecycle.transitionTo('Cancelled');
    trainingSession.updateState('Cancelled');
  }

  public getHistoryLogs() {
    return trainingHistory.getHistory();
  }

  public getMetricsSummary() {
    return trainingMetrics.getMetrics();
  }

  public subscribe(listener: TrainingEventListener): () => void {
    return trainingEvents.subscribe(listener);
  }

  public clearHistory(): void {
    trainingSession.clear();
    trainingLifecycle.clear();
    trainingHistory.clear();
    trainingMetrics.clear();
    trainingEvents.clear();
  }
}

export const trainingEngine = new TrainingEngine();
export default trainingEngine;

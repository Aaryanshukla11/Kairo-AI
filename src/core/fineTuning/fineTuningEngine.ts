import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import {
  FineTuningMethod,
  FineTuningSessionModel,
  FineTuningReport,
  FineTuningManifest,
  FineTuningEventListener
} from './fineTuningTypes';
import { fineTuningCoordinator } from './fineTuningCoordinator';
import { fineTuningSessionManager } from './fineTuningSession';
import { fineTuningHistory } from './fineTuningHistory';
import { fineTuningMetrics } from './fineTuningMetrics';
import { fineTuningEvents } from './fineTuningEvents';
import { adapterManager } from './adapterManager';

export class FineTuningEngine {
  public async executeFineTuning(
    sessionId: string,
    baseModelId: string,
    tokenizerVersion: string,
    datasetVersion: string,
    config: TrainingConfigModel,
    method: FineTuningMethod,
    modelParameters: number,
    adapterSettings?: any
  ): Promise<{
    session: FineTuningSessionModel;
    report: FineTuningReport;
    manifest: FineTuningManifest;
  }> {
    return fineTuningCoordinator.executePipeline(
      sessionId,
      baseModelId,
      tokenizerVersion,
      datasetVersion,
      config,
      method,
      modelParameters,
      adapterSettings
    );
  }

  public getSession(sessionId: string): FineTuningSessionModel | undefined {
    return fineTuningSessionManager.getSession(sessionId);
  }

  public getHistory(sessionId?: string) {
    return fineTuningHistory.getHistory(sessionId);
  }

  public subscribe(listener: FineTuningEventListener): () => void {
    return fineTuningEvents.subscribe(listener);
  }

  public clearHistory(sessionId?: string): void {
    if (sessionId) {
      fineTuningSessionManager.clear();
      fineTuningMetrics.clearSession(sessionId);
      adapterManager.removeAdapter(sessionId);
    } else {
      fineTuningSessionManager.clear();
      fineTuningMetrics.clearAll();
      fineTuningHistory.clear();
      fineTuningEvents.clear();
      adapterManager.clear();
    }
  }
}

export const fineTuningEngine = new FineTuningEngine();
export default fineTuningEngine;

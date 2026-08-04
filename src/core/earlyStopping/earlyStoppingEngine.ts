import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ValidationMetricModel } from '../validationLoop/validationTypes';
import {
  StoppingReportModel,
  StoppingManifest,
  StoppingPolicyConfig,
  EarlyStoppingEventListener
} from './stoppingTypes';
import { stoppingCoordinator } from './stoppingCoordinator';
import { stoppingPolicyManager } from './stoppingPolicyManager';
import { stoppingHistory } from './stoppingHistory';
import { stoppingMetrics } from './stoppingMetrics';
import { patienceManager } from './patienceManager';
import { stoppingEvents } from './stoppingEvents';

export class EarlyStoppingEngine {
  public async evaluateStoppingCriteria(
    sessionId: string,
    session: TrainingSessionModel,
    config: TrainingConfigModel,
    valMetrics?: ValidationMetricModel,
    checkpoint?: CheckpointModel
  ): Promise<{
    report: StoppingReportModel;
    manifest: StoppingManifest;
  }> {
    return stoppingCoordinator.executePipeline(sessionId, session, config, valMetrics, checkpoint);
  }

  public registerSessionPolicies(sessionId: string, policies: StoppingPolicyConfig[]): void {
    stoppingPolicyManager.registerPolicies(sessionId, policies);
  }

  public getHistory(sessionId?: string) {
    return stoppingHistory.getHistory(sessionId);
  }

  public subscribe(listener: EarlyStoppingEventListener): () => void {
    return stoppingEvents.subscribe(listener);
  }

  public clearHistory(sessionId?: string): void {
    if (sessionId) {
      stoppingPolicyManager.clearSession(sessionId);
      stoppingMetrics.clearSession(sessionId);
      patienceManager.clearSession(sessionId);
    } else {
      stoppingPolicyManager.clearAll();
      stoppingMetrics.clearAll();
      patienceManager.clearAll();
      stoppingHistory.clear();
      stoppingEvents.clear();
    }
  }
}

export const earlyStoppingEngine = new EarlyStoppingEngine();
export default earlyStoppingEngine;

import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import {
  ValidationMode,
  ValidationReportModel,
  ValidationManifest,
  ValidationLoopEventListener,
  ValidationMetricModel
} from './validationTypes';
import { validationCoordinator } from './validationCoordinator';
import { validationScheduler } from './validationScheduler';
import { validationHistory } from './validationHistory';
import { validationMetrics } from './validationMetrics';
import { validationEvents } from './validationEvents';

export class ValidationLoop {
  public async processValidationRun(
    sessionId: string,
    mode: ValidationMode,
    sessionState: TrainingSessionModel,
    validationDatasetPath: string,
    checkpoint: CheckpointModel,
    trainingConfig: TrainingConfigModel,
    baselineCheckpoint?: CheckpointModel,
    baselineMetrics?: ValidationMetricModel
  ): Promise<{
    validationReport: ValidationReportModel;
    manifest: ValidationManifest;
    isBetterThanBaseline: boolean;
  }> {
    return validationCoordinator.executePipeline(
      sessionId,
      mode,
      sessionState,
      validationDatasetPath,
      checkpoint,
      trainingConfig,
      baselineCheckpoint,
      baselineMetrics
    );
  }

  public shouldTriggerValidation(
    mode: ValidationMode,
    session: TrainingSessionModel,
    config: TrainingConfigModel
  ): boolean {
    return validationScheduler.shouldTriggerValidation(mode, session, config);
  }

  public getHistory(sessionId?: string) {
    return validationHistory.getHistory(sessionId);
  }

  public getMetricsHistory(sessionId: string): ValidationMetricModel[] {
    return validationMetrics.getMetricsHistory(sessionId);
  }

  public subscribe(listener: ValidationLoopEventListener): () => void {
    return validationEvents.subscribe(listener);
  }

  public clearHistory(sessionId?: string): void {
    if (sessionId) {
      validationMetrics.clearSession(sessionId);
    } else {
      validationHistory.clear();
      validationMetrics.clearAll();
      validationEvents.clear();
    }
  }
}

export const validationLoop = new ValidationLoop();
export default validationLoop;

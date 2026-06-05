import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import {
  FineTuningMethod,
  FineTuningSessionModel,
  FineTuningReport,
  FineTuningManifest,
  FineTuningEventType,
  FineTuningMetricModel
} from './fineTuningTypes';
import { fineTuningValidator } from './fineTuningValidator';
import { fineTuningSessionManager } from './fineTuningSession';
import { adaptationStrategy } from './adaptationStrategy';
import { fineTuningScheduler } from './fineTuningScheduler';
import { fineTuningMetrics } from './fineTuningMetrics';
import { fineTuningHistory } from './fineTuningHistory';
import { fineTuningEvents } from './fineTuningEvents';
import { fineTuningManifest } from './fineTuningManifest';

export class FineTuningCoordinator {
  public async executePipeline(
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
    const timestamp = Date.now();

    // 1. Load Base Model
    fineTuningEvents.emit({
      type: FineTuningEventType.LoadBaseModel,
      timestamp,
      sessionId,
      payload: { baseModelId }
    });

    // 2. Load Dataset
    fineTuningEvents.emit({
      type: FineTuningEventType.LoadDataset,
      timestamp,
      sessionId,
      payload: { datasetVersion }
    });

    // 3. Load Configuration
    fineTuningEvents.emit({
      type: FineTuningEventType.LoadConfiguration,
      timestamp,
      sessionId,
      payload: { config }
    });

    const validationRes = fineTuningValidator.validateSetup(
      baseModelId,
      tokenizerVersion,
      datasetVersion,
      config,
      adapterSettings
    );

    if (!validationRes.isValid) {
      throw new Error(`Fine-Tuning validation failed: ${validationRes.errors.join('; ')}`);
    }

    // 4. Load Adapter / train parameters
    fineTuningEvents.emit({
      type: FineTuningEventType.LoadAdapter,
      timestamp,
      sessionId,
      payload: { adapterSettings }
    });

    const trainableParams = adaptationStrategy.calculateParameters(
      method,
      modelParameters,
      method === 'lora' ? adapterSettings : undefined,
      method === 'qlora' ? adapterSettings : undefined
    );

    // 5. Initialize Session
    fineTuningEvents.emit({
      type: FineTuningEventType.InitializeSession,
      timestamp,
      sessionId,
      payload: { trainableParams }
    });

    const totalSteps = config.hyperparameters?.epochs 
      ? config.hyperparameters.epochs * 100 
      : 500;

    const session = fineTuningSessionManager.createSession(
      sessionId,
      baseModelId,
      method,
      config.hyperparameters?.epochs || 5,
      totalSteps,
      trainableParams
    );

    fineTuningSessionManager.updateSession(sessionId, { status: 'active' });

    // 6. Execute Fine-Tuning step simulation
    const evalFrequency = config.evaluationFrequency || 100;
    const checkpointFrequency = config.checkpointFrequency || 100;
    const metricHistory: FineTuningMetricModel[] = [];

    // Simulate epoch steps execution loop
    for (let step = 1; step <= totalSteps; step++) {
      const epoch = Math.ceil(step / 100);
      const trainingLoss = parseFloat((1.5 - (step / totalSteps) * 0.8 + Math.random() * 0.05).toFixed(4));
      const validationLoss = parseFloat((trainingLoss + 0.05 + Math.random() * 0.05).toFixed(4));

      const metricEntry: FineTuningMetricModel = {
        epoch,
        step,
        trainingLoss,
        validationLoss,
        learningRate: config.hyperparameters?.learningRate || 1e-4,
        gpuUsagePercent: 85,
        vramUsageMB: method === 'qlora' ? 4200 : method === 'lora' ? 6200 : 14200,
        elapsedSec: step * 0.5
      };

      fineTuningMetrics.logMetric(sessionId, metricEntry);
      metricHistory.push(metricEntry);

      fineTuningSessionManager.updateSession(sessionId, {
        currentEpoch: epoch,
        currentStep: step
      });

      fineTuningEvents.emit({
        type: FineTuningEventType.ExecuteStep,
        timestamp: Date.now(),
        sessionId,
        payload: { step, epoch, trainingLoss }
      });

      // 7. Validation
      const currentSession = fineTuningSessionManager.getSession(sessionId) || session;
      if (fineTuningScheduler.shouldRunValidation(currentSession, evalFrequency)) {
        fineTuningEvents.emit({
          type: FineTuningEventType.ValidationPass,
          timestamp: Date.now(),
          sessionId,
          payload: { step, validationLoss }
        });
      }

      // 8. Checkpoint
      if (fineTuningScheduler.shouldSaveCheckpoint(currentSession, checkpointFrequency)) {
        const checkpointId = `CHK-FT-${sessionId}-${step}`;
        fineTuningSessionManager.updateSession(sessionId, { checkpointId });
        fineTuningEvents.emit({
          type: FineTuningEventType.CheckpointSaved,
          timestamp: Date.now(),
          sessionId,
          payload: { checkpointId, step }
        });
      }
    }

    // 9. Experiment Update
    fineTuningEvents.emit({
      type: FineTuningEventType.ExperimentUpdated,
      timestamp: Date.now(),
      sessionId,
      payload: { status: 'completed' }
    });

    fineTuningSessionManager.updateSession(sessionId, { status: 'completed' });

    // 10. Completion
    const report: FineTuningReport = {
      reportId: `REP-FT-${sessionId}-${Date.now()}`,
      sessionId,
      metrics: metricHistory,
      trainableParams,
      completedAt: Date.now(),
      isResumable: true
    };

    const configChecksum = `sha256-${config.configId}`;
    const manifest = fineTuningManifest.createManifest(
      report,
      method,
      baseModelId,
      datasetVersion,
      tokenizerVersion,
      configChecksum
    );

    fineTuningEvents.emit({
      type: FineTuningEventType.Completion,
      timestamp: Date.now(),
      sessionId,
      payload: { report, manifest }
    });

    fineTuningHistory.logAction(
      sessionId,
      `Supervised Fine-Tuning pipeline completed using method ${method}. Trainable params: ${trainableParams.trainableParameters}`,
      report
    );

    const finalSession = fineTuningSessionManager.getSession(sessionId) || session;
    return {
      session: finalSession,
      report,
      manifest
    };
  }
}

export const fineTuningCoordinator = new FineTuningCoordinator();
export default fineTuningCoordinator;

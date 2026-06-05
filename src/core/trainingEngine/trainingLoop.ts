import { TrainingSessionModel, TrainingEventType } from './trainingTypes';
import { trainingExecutor } from './trainingExecutor';
import { trainingScheduler } from './trainingScheduler';
import { trainingMetrics } from './trainingMetrics';
import { trainingEvents } from './trainingEvents';
import { trainingSession } from './trainingSession';
import { trainingHistory } from './trainingHistory';
import { checkpointManager } from '../checkpointManager/checkpointManager';
import { experimentTracker } from '../experimentTracker/experimentTracker';

export class TrainingLoop {
  private isInterrupted = false;

  public requestInterruption(): void {
    this.isInterrupted = true;
  }

  public async run(
    session: TrainingSessionModel,
    config: any,
    framework: string,
    onStepCallback?: (metrics: any) => void
  ): Promise<{
    averageLoss: number;
    finalValidationLoss: number;
    savedCheckpoints: string[];
  }> {
    this.isInterrupted = false;
    const initialLR = config.hyperparameters.learningRate || 1e-4;
    const schedulerType = config.hyperparameters.scheduler || 'cosine';
    const totalSteps = session.totalSteps;
    const epochs = session.totalEpochs;
    const batchesPerEpoch = Math.ceil(totalSteps / epochs);

    let stepCounter = session.currentStep;
    let totalLossSum = 0;
    let lastValidationLoss = 2.5;
    const savedCheckpoints: string[] = [];

    const startTime = Date.now();

    for (let epoch = session.currentEpoch + 1; epoch <= epochs; epoch++) {
      if (this.isInterrupted) break;
      
      trainingEvents.emit(TrainingEventType.EpochStarted, { epoch });
      trainingHistory.logAction(session.sessionId, `Started Epoch ${epoch}.`);

      for (let batch = 1; batch <= batchesPerEpoch; batch++) {
        if (this.isInterrupted) break;
        stepCounter++;

        // 1. Calculate learning rate
        const lr = trainingScheduler.calculateLearningRate(initialLR, stepCounter, totalSteps, schedulerType);

        // 2. Execute Batch
        const result = trainingExecutor.executeBatchStep(stepCounter, framework);
        totalLossSum += result.loss;

        // 3. Log metrics
        const elapsedSec = (Date.now() - startTime) / 1000;
        const speed = config.hyperparameters.batchSize * 1024; // tokens per sec representation
        
        const metricRecord = trainingMetrics.logBatchMetrics(
          epoch,
          batch,
          result.loss,
          lr,
          result.gpuUsage,
          result.vram,
          speed,
          elapsedSec,
          totalSteps,
          stepCounter,
          lastValidationLoss
        );

        trainingSession.recordProgress(epoch, stepCounter, metricRecord);
        trainingEvents.emit(TrainingEventType.BatchExecuted, { step: stepCounter, loss: result.loss });

        if (onStepCallback) {
          onStepCallback(metricRecord);
        }

        // 4. Periodical mock Validation (e.g. every 5 steps)
        if (stepCounter % 5 === 0) {
          lastValidationLoss = parseFloat((result.loss + Math.random() * 0.05).toFixed(4));
          trainingEvents.emit(TrainingEventType.ValidationExecuted, { step: stepCounter, validationLoss: lastValidationLoss });
        }

        // 5. Periodical Checkpointing (e.g. every 10 steps)
        if (stepCounter % 10 === 0) {
          trainingEvents.emit(TrainingEventType.CheckpointSaved);
          
          const chkResult = await checkpointManager.createCheckpoint(
            '1.0.0',
            undefined,
            stepCounter,
            epoch,
            stepCounter,
            { type: config.hyperparameters.optimizer, lr, step: stepCounter },
            { type: config.hyperparameters.scheduler, lastEpoch: epoch },
            { seed: config.randomSeed || 42 },
            session.tokenizerVersion,
            session.datasetVersion,
            config.version || '1.0.0',
            { validationLoss: lastValidationLoss, trainingLoss: result.loss }
          );

          savedCheckpoints.push(chkResult.checkpoint.checkpointId);
          trainingHistory.logAction(session.sessionId, `Saved checkpoint ${chkResult.checkpoint.checkpointId} at step ${stepCounter}.`);
        }

        // 6. Periodical Experiment update (e.g. every 15 steps)
        if (stepCounter % 15 === 0) {
          await experimentTracker.createExperiment(
            '1.0.0',
            'Pretraining',
            config,
            session.datasetVersion,
            session.tokenizerVersion,
            undefined,
            { deviceType: 'cuda' },
            config.randomSeed || 42,
            { loss: result.loss },
            { trainingLoss: result.loss, validationLoss: lastValidationLoss },
            [`/weights/step-${stepCounter}.bin`]
          );
          trainingEvents.emit(TrainingEventType.ExperimentUpdated);
        }
      }

      trainingEvents.emit(TrainingEventType.EpochEnded, { epoch });
      trainingHistory.logAction(session.sessionId, `Completed Epoch ${epoch}.`);
    }

    return {
      averageLoss: parseFloat((totalLossSum / stepCounter).toFixed(4)),
      finalValidationLoss: lastValidationLoss,
      savedCheckpoints
    };
  }
}

export const trainingLoop = new TrainingLoop();
export default trainingLoop;

import {
  TrainingSessionModel,
  TrainingReportModel,
  TrainingState,
  TrainingManifestModel,
  TrainingEventType
} from './trainingTypes';
import { trainingSession } from './trainingSession';
import { trainingValidator } from './trainingValidator';
import { trainingLifecycle } from './trainingLifecycle';
import { trainingLoop } from './trainingLoop';
import { trainingManifest } from './trainingManifest';
import { trainingHistory } from './trainingHistory';
import { trainingEvents } from './trainingEvents';

export class TrainingCoordinator {
  public async execute(
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
    
    // 1. Preparing
    trainingLifecycle.transitionTo('Preparing');
    trainingEvents.emit(TrainingEventType.TrainingStarted);

    // 2. Loading Inputs (Load Dataset → Load Tokenizer → Load Model)
    trainingLifecycle.transitionTo('Loading');
    const validator = trainingValidator.validateInputs(datasetVersion, tokenizerVersion, config, checkpoint, hardware);
    if (!validator.isValid) {
      trainingLifecycle.transitionTo('Failed');
      throw new Error(`Training Engine Initialization Error: ${validator.errors.join(', ')}`);
    }

    // 3. Create Session
    const sess = trainingSession.initialize(datasetVersion, tokenizerVersion, config.configId || 'cfg-1', totalEpochs, totalSteps);
    trainingHistory.logAction(sess.sessionId, `Initialized training sessionSESS-TRAIN.`);

    // 4. Initialize Optimizer
    trainingHistory.logAction(sess.sessionId, `Initialized optimizer parameters: ${config.hyperparameters.optimizer}.`);

    // If checkpoint is provided, load its states
    if (checkpoint) {
      sess.currentEpoch = checkpoint.epoch;
      sess.currentStep = checkpoint.trainingStep;
      trainingLifecycle.transitionTo('Resuming');
      trainingHistory.logAction(sess.sessionId, `Resumed session from checkpoint ${checkpoint.checkpointId}.`);
    }

    // 5. Training Loop
    trainingLifecycle.transitionTo('Training');
    
    const loopRes = await trainingLoop.run(sess, config, framework, onStepCallback);

    // 6. Complete Session
    const finalState: TrainingState = 'Completed';
    trainingLifecycle.transitionTo(finalState);
    trainingSession.updateState(finalState);

    const report: TrainingReportModel = {
      sessionId: sess.sessionId,
      status: finalState,
      finalEpoch: sess.currentEpoch,
      finalStep: sess.currentStep,
      averageLoss: loopRes.averageLoss,
      finalValidationLoss: loopRes.finalValidationLoss,
      elapsedTimeSec: (Date.now() - sess.startTime) / 1000,
      checkpointsSaved: loopRes.savedCheckpoints
    };

    const manifest = trainingManifest.createManifest(sess);
    trainingHistory.logAction(sess.sessionId, `Generated session report & manifest.`);

    trainingEvents.emit(TrainingEventType.TrainingEnded, { report });

    return {
      session: sess,
      manifest,
      report
    };
  }
}

export const trainingCoordinator = new TrainingCoordinator();
export default trainingCoordinator;

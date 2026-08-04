import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import {
  ValidationMode,
  ValidationReportModel,
  ValidationManifest,
  ValidationLoopEventType,
  ValidationMetricModel,
  CheckpointComparison
} from './validationTypes';
import { validationValidator } from './validationValidator';
import { validationRunner } from './validationRunner';
import { metricAggregator } from './metricAggregator';
import { overfittingDetector } from './overfittingDetector';
import { checkpointEvaluator } from './checkpointEvaluator';
import { validationReportCompiler } from './validationReport';
import { validationManifest } from './validationManifest';
import { validationHistory } from './validationHistory';
import { validationMetrics } from './validationMetrics';
import { validationEvents } from './validationEvents';

export class ValidationCoordinator {
  public async executePipeline(
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
    // 1. Receive Training State
    validationEvents.emit(ValidationLoopEventType.IngestState, { sessionId, sessionState });

    // Validate inputs
    const inputValidation = validationValidator.validateInputs(
      checkpoint,
      validationDatasetPath,
      trainingConfig
    );

    // 2. Load Validation Dataset
    validationEvents.emit(ValidationLoopEventType.DatasetLoaded, { sessionId, validationDatasetPath });

    // 3. Execute Validation
    validationEvents.emit(ValidationLoopEventType.ValidationExecuted, { sessionId, checkpointId: checkpoint?.checkpointId });
    const rawMetrics = await validationRunner.runEvaluationPass(
      trainingConfig?.hyperparameters?.optimizer || 'mock', // optimizer acts as a proxy indicator or framework
      checkpoint?.checkpointId || 'mock-chk',
      validationDatasetPath
    );

    // 4. Collect Metrics
    validationEvents.emit(ValidationLoopEventType.MetricsCollected, { sessionId, rawMetrics });

    // 5. Aggregate Results
    // In our simplified pipeline, we aggregate this pass (we could run multiple sub-passes or batches and aggregate them)
    const aggregatedMetrics = metricAggregator.aggregate([rawMetrics]);
    validationEvents.emit(ValidationLoopEventType.ResultsAggregated, { sessionId, aggregatedMetrics });

    // 6. Compare History (Overfitting & Baseline comparison)
    validationEvents.emit(ValidationLoopEventType.HistoryCompared, { sessionId });

    // Fetch existing historical validation runs for this session
    const pastValMetrics = validationMetrics.getMetricsHistory(sessionId);
    const pastTrainMetrics = sessionState.metrics || [];

    const overfittingReport = overfittingDetector.detectOverfitting(
      aggregatedMetrics,
      pastTrainMetrics,
      pastValMetrics
    );

    let comparison: CheckpointComparison | undefined;
    let isBetterThanBaseline = true;

    if (baselineCheckpoint && baselineMetrics) {
      comparison = checkpointEvaluator.compare(
        aggregatedMetrics,
        baselineMetrics,
        checkpoint.checkpointId,
        baselineCheckpoint.checkpointId
      );
      isBetterThanBaseline = comparison.isBetter;
    }

    // 7. Generate Reports
    const isValid = inputValidation.isValid && !overfittingReport.lossDivergence;
    const errors = [...inputValidation.errors];
    if (overfittingReport.lossDivergence) {
      errors.push('Validation execution failed validation rules: Severe overfitting loss divergence.');
    }

    const validationReport = validationReportCompiler.compileReport(
      sessionId,
      mode,
      isValid,
      errors,
      aggregatedMetrics,
      overfittingReport,
      comparison
    );

    const manifest = validationManifest.createManifest(validationReport);
    validationEvents.emit(ValidationLoopEventType.ReportsGenerated, { sessionId, validationReport, manifest });

    // 8. Publish Events & History
    validationMetrics.logMetrics(sessionId, aggregatedMetrics);
    validationHistory.logAction(
      sessionId,
      `Validation run completed for mode ${mode}. Loss: ${aggregatedMetrics.validationLoss}, Accuracy: ${aggregatedMetrics.accuracy}, Overfitting Severity: ${overfittingReport.severity}`,
      validationReport
    );

    validationEvents.emit(ValidationLoopEventType.EventsPublished, { sessionId, reportId: validationReport.reportId });

    return {
      validationReport,
      manifest,
      isBetterThanBaseline
    };
  }
}

export const validationCoordinator = new ValidationCoordinator();
export default validationCoordinator;

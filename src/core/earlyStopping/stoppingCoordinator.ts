import { TrainingSessionModel } from '../trainingEngine/trainingTypes';
import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { ValidationMetricModel } from '../validationLoop/validationTypes';
import {
  StoppingReportModel,
  StoppingManifest,
  EarlyStoppingEventType
} from './stoppingTypes';
import { stoppingValidator } from './stoppingValidator';
import { stoppingPolicyManager } from './stoppingPolicyManager';
import { patienceManager } from './patienceManager';
import { convergenceMonitor } from './convergenceMonitor';
import { plateauDetector } from './plateauDetector';
import { stoppingDecisionEngine } from './stoppingDecisionEngine';
import { recommendationEngine } from './recommendationEngine';
import { stoppingHistory } from './stoppingHistory';
import { stoppingMetrics } from './stoppingMetrics';
import { stoppingEvents } from './stoppingEvents';
import { stoppingManifest } from './stoppingManifest';
import { validationMetricProvider, convergenceProvider, customPolicyProvider } from './providers';

export class StoppingCoordinator {
  public async executePipeline(
    sessionId: string,
    session: TrainingSessionModel,
    config: TrainingConfigModel,
    valMetrics?: ValidationMetricModel,
    checkpoint?: CheckpointModel
  ): Promise<{
    report: StoppingReportModel;
    manifest: StoppingManifest;
  }> {
    const timestamp = Date.now();

    // 1. Receive Metrics
    stoppingEvents.emit({
      type: EarlyStoppingEventType.IngestMetrics,
      timestamp,
      sessionId,
      payload: { session, valMetrics, checkpoint }
    });

    const policies = stoppingPolicyManager.getPolicies(sessionId);

    // 2. Validate Inputs
    const validationRes = stoppingValidator.validateInputs(session, config, valMetrics, policies);
    stoppingEvents.emit({
      type: EarlyStoppingEventType.MetricsValidated,
      timestamp,
      sessionId,
      payload: validationRes
    });

    if (!validationRes.isValid) {
      throw new Error(`Stopping Validation failed: ${validationRes.errors.join('; ')}`);
    }

    if (valMetrics) {
      stoppingMetrics.logValidationMetric(sessionId, valMetrics);
    }

    // 3. Evaluate Policies (using the primary registered policy config)
    const policy = policies[0];
    const pastValScores = valMetrics ? stoppingMetrics.getMetricValues(sessionId, policy.metric as any) : [];
    
    // Get best value from patience state
    const patienceStateBefore = patienceManager.getOrCreateState(sessionId, policy.metric, valMetrics ? (valMetrics as any)[policy.metric] : 0);
    const bestValue = patienceStateBefore.bestScore;

    let hasImproved = false;
    let currentVal = 0;

    if (policy.metric === 'custom') {
      const res = customPolicyProvider.evaluate({ customValue: valMetrics?.validationLoss }, policy, bestValue);
      hasImproved = res.hasImproved;
      currentVal = res.currentVal;
    } else if (policy.metric === 'trainingLoss') {
      const res = convergenceProvider.evaluate(session.metrics || [], policy, bestValue);
      hasImproved = res.hasImproved;
      currentVal = res.currentVal;
    } else if (valMetrics) {
      const res = validationMetricProvider.evaluate(valMetrics, policy, bestValue);
      hasImproved = res.hasImproved;
      currentVal = res.currentVal;
    }

    stoppingEvents.emit({
      type: EarlyStoppingEventType.PoliciesEvaluated,
      timestamp,
      sessionId,
      payload: { policy, hasImproved, currentVal, bestValue }
    });

    // 4. Analyze Trends (Convergence and Plateau)
    const convergenceAnalysis = convergenceMonitor.analyzeConvergence(session.metrics || []);
    const plateauAnalysis = plateauDetector.detectPlateau(pastValScores, 0.005, policy.patienceWindow);
    
    // Simple overfitting heuristic: training loss converges but validation loss is plateaued/rising
    const isOverfitting =
      convergenceAnalysis.isConverging &&
      !convergenceAnalysis.hasStagnated &&
      plateauAnalysis.isPlateaued &&
      valMetrics !== undefined &&
      session.metrics.length > 0 &&
      valMetrics.validationLoss - session.metrics[session.metrics.length - 1].trainingLoss > 0.4;

    stoppingEvents.emit({
      type: EarlyStoppingEventType.TrendsAnalyzed,
      timestamp,
      sessionId,
      payload: { convergenceAnalysis, plateauAnalysis, isOverfitting }
    });

    // 5. Check Patience
    const state = patienceManager.updateState(
      sessionId,
      policy.metric,
      currentVal,
      session.currentStep,
      hasImproved,
      policy.mode
    );

    const patienceReport = patienceManager.calculateReport(sessionId, policy.metric, policy.patienceWindow);
    stoppingEvents.emit({
      type: EarlyStoppingEventType.PatienceChecked,
      timestamp,
      sessionId,
      payload: patienceReport
    });

    // 6. Generate Decision
    const stoppingDecision = stoppingDecisionEngine.generateDecision(
      sessionId,
      policy,
      currentVal,
      state.bestScore,
      state.stepsSinceImprovement,
      plateauAnalysis.plateauLength,
      isOverfitting
    );

    stoppingEvents.emit({
      type: EarlyStoppingEventType.DecisionGenerated,
      timestamp,
      sessionId,
      payload: stoppingDecision
    });

    // Generate Recommendation
    const recommendationReport = recommendationEngine.generateRecommendation(
      policy,
      stoppingDecision,
      plateauAnalysis.plateauLength,
      isOverfitting,
      convergenceAnalysis.hasStagnated
    );

    // Compile Report & Manifest
    const reportId = `REP-STOP-${sessionId}-${timestamp}`;
    const report: StoppingReportModel = {
      reportId,
      sessionId,
      decision: stoppingDecision,
      patienceReport,
      recommendationReport,
      createdAt: timestamp
    };

    const manifest = stoppingManifest.createManifest(report);
    
    // 7. Publish Reports
    stoppingEvents.emit({
      type: EarlyStoppingEventType.ReportsPublished,
      timestamp,
      sessionId,
      payload: { report, manifest }
    });

    stoppingHistory.logAction(
      sessionId,
      `Stopping pipeline executed at step ${session.currentStep}. Decision: ${stoppingDecision.decision}. Reason: ${stoppingDecision.reason}`,
      report
    );

    // 8. Update Training State
    stoppingEvents.emit({
      type: EarlyStoppingEventType.TrainingStateUpdated,
      timestamp,
      sessionId,
      payload: { decision: stoppingDecision.decision }
    });

    return {
      report,
      manifest
    };
  }
}

export const stoppingCoordinator = new StoppingCoordinator();
export default stoppingCoordinator;

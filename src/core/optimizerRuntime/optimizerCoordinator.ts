import {
  OptimizerStateModel,
  OptimizerReportModel,
  LrReportModel,
  ParameterUpdateReportModel,
  ValidationReportModel,
  OptimizerEventType,
  LrScheduleType,
  OptimizerPolicyConfig
} from './optimizerTypes';
import { optimizerValidator } from './optimizerValidator';
import { optimizerStateManager } from './optimizerStateManager';
import { optimizerPolicies } from './optimizerPolicies';
import { optimizerScheduler } from './optimizerScheduler';
import { parameterUpdateMonitor } from './parameterUpdateMonitor';
import { optimizerHistory } from './optimizerHistory';
import { optimizerMetrics } from './optimizerMetrics';
import { optimizerEvents } from './optimizerEvents';
import { adamProvider, adamwProvider, sgdProvider, lionProvider } from './providers';

export class OptimizerCoordinator {
  public async executePipeline(
    sessionId: string,
    state: OptimizerStateModel,
    gradNorm: number,
    schedule: LrScheduleType,
    policy: OptimizerPolicyConfig,
    totalSteps: number,
    warmupSteps: number = 0
  ): Promise<{
    validationReport: ValidationReportModel;
    lrReport: LrReportModel;
    updateReport: ParameterUpdateReportModel;
    optimizerReport: OptimizerReportModel;
  }> {
    
    // 1. Receive Gradients
    optimizerEvents.emit(OptimizerEventType.GradientsReceived, { sessionId });

    // 2. Validate state before optimization
    const validationReport = optimizerValidator.validate(state, schedule);
    optimizerEvents.emit(OptimizerEventType.Validated, { validationReport });
    if (!validationReport.isValid) {
      optimizerHistory.logAction(sessionId, 'Validation failed: ' + validationReport.errors.join(', '));
    }

    // 3. Load state
    let activeState = optimizerStateManager.loadState(sessionId);
    if (!activeState) {
      activeState = { ...state };
    }
    optimizerEvents.emit(OptimizerEventType.StateLoaded, { activeState });

    // 4. Apply policies
    optimizerPolicies.applyPolicy(activeState, policy);

    // 5. Apply Updates (framework specific step simulation)
    if (activeState.optimizerType === 'Adam') {
      adamProvider.step(activeState);
    } else if (activeState.optimizerType === 'AdamW') {
      adamwProvider.step(activeState);
    } else if (activeState.optimizerType === 'SGD') {
      sgdProvider.step(activeState);
    } else if (activeState.optimizerType === 'Lion') {
      lionProvider.step(activeState);
    }
    optimizerEvents.emit(OptimizerEventType.UpdatesApplied);

    // 6. Update Learning Rate
    const lrReport = optimizerScheduler.updateLr(
      schedule,
      state.learningRate,
      activeState.stepCount,
      totalSteps,
      warmupSteps
    );
    activeState.learningRate = lrReport.currentLr;
    optimizerMetrics.logLr();
    optimizerEvents.emit(OptimizerEventType.LrUpdated, { lrReport });

    // 7. Validate Parameter Updates bounds
    const updateReport = parameterUpdateMonitor.monitorUpdates(gradNorm, activeState.learningRate);
    optimizerEvents.emit(OptimizerEventType.ParametersValidated, { updateReport });

    // 8. Store state
    optimizerStateManager.storeState(sessionId, activeState);
    optimizerMetrics.logStep();
    optimizerEvents.emit(OptimizerEventType.StateStored);

    // 9. Generate report
    const optimizerReport: OptimizerReportModel = {
      reportId: `OPT-REP-${sessionId}-${Date.now()}`,
      sessionId,
      optimizerType: activeState.optimizerType,
      learningRate: activeState.learningRate,
      stepCount: activeState.stepCount,
      parametersUpdatedCount: 1000000, // mock count
      createdAt: Date.now()
    };
    optimizerHistory.logAction(sessionId, `Optimizer step ${activeState.stepCount} completed. LR=${activeState.learningRate}.`);
    optimizerEvents.emit(OptimizerEventType.ReportsGenerated, { optimizerReport });

    return {
      validationReport,
      lrReport,
      updateReport,
      optimizerReport
    };
  }
}

export const optimizerCoordinator = new OptimizerCoordinator();
export default optimizerCoordinator;

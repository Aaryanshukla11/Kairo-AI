import { HardwareProfile, TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { GradientReportModel } from '../gradientEngine/gradientTypes';
import { LossReportModel } from '../lossEngine/lossTypes';
import {
  PrecisionReport,
  PrecisionMode,
  PrecisionEventType
} from './precisionTypes';
import { precisionPolicyManager } from './precisionPolicyManager';
import { precisionCompatibility } from './precisionCompatibility';
import { precisionSelector } from './precisionSelector';
import { lossScalingManager } from './lossScalingManager';
import { overflowMonitor } from './overflowMonitor';
import { precisionHistory } from './precisionHistory';
import { precisionMetrics } from './precisionMetrics';
import { precisionEvents } from './precisionEvents';

export class PrecisionCoordinator {
  public async executePipeline(
    sessionId: string,
    step: number,
    config: TrainingConfigModel,
    hardwareProfile: HardwareProfile,
    gradientReport?: GradientReportModel,
    lossReport?: LossReportModel
  ): Promise<{
    precisionReport: PrecisionReport;
    precisionMode: PrecisionMode;
    scalingFactor: number;
    hasOverflow: boolean;
  }> {
    // 1. Receive Configuration
    precisionEvents.emit(PrecisionEventType.ConfigReceived, { sessionId, step, config });

    const requestedMode = config.hyperparameters.precision || 'fp32';
    const policy = precisionPolicyManager.getOrCreatePolicy(sessionId, requestedMode);

    // 2. Validate Hardware Compatibility
    const compatibilityReport = precisionCompatibility.validateCompatibility(hardwareProfile, requestedMode);
    precisionEvents.emit(PrecisionEventType.HardwareValidated, { sessionId, compatibilityReport });

    // 3. Select Precision
    const selectedPrecision = precisionSelector.selectPrecision(requestedMode, hardwareProfile);
    precisionEvents.emit(PrecisionEventType.PrecisionSelected, { sessionId, selectedPrecision });

    // 4. Configure Loss Scaling
    let scalingReport = lossScalingManager.getScalingReport(sessionId);
    // If not matching active policy or scaling mode, configure it
    const activePolicy = precisionPolicyManager.getPolicy(sessionId) || policy;
    if (scalingReport.mode !== activePolicy.lossScalingMode) {
      lossScalingManager.configure(sessionId, activePolicy);
      scalingReport = lossScalingManager.getScalingReport(sessionId);
    }
    precisionEvents.emit(PrecisionEventType.LossScalingConfigured, { sessionId, scalingReport });

    // 5. Monitor Execution
    precisionEvents.emit(PrecisionEventType.ExecutionMonitored, { sessionId, step });

    // 6. Detect Overflow
    const isScaleAtMin = scalingReport.currentScale === activePolicy.minScale;
    const overflowReport = overflowMonitor.monitorExecution(
      sessionId,
      step,
      gradientReport,
      lossReport,
      isScaleAtMin
    );
    if (overflowReport.hasOverflow) {
      precisionEvents.emit(PrecisionEventType.OverflowDetected, { sessionId, overflowReport });
    }

    // 7. Adjust Policies (Scaling Adjustments)
    lossScalingManager.adjustScale(sessionId, overflowReport.hasOverflow, step);
    const updatedScalingReport = lossScalingManager.getScalingReport(sessionId);
    precisionEvents.emit(PrecisionEventType.PolicyAdjusted, { sessionId, scalingReport: updatedScalingReport });

    // 8. Dynamic recommendations
    const recommendations: string[] = [];
    if (overflowReport.persistentOverflow) {
      recommendations.push(
        'Persistent overflow detected! Dynamic loss scaling has hit minimum bounds and cannot stabilize gradients.',
        'Action Required: Consider upgrading hardware to support BF16, or switch precision mode to FP32 for numerical stability.'
      );
    }
    if (overflowReport.hasUnderflow) {
      recommendations.push(
        'Gradient underflow detected in some parameter layers.',
        'Recommendation: Consider raising your initial scaling factor or switching scaling mode to dynamic.'
      );
    }
    if (!compatibilityReport.isCompatible) {
      recommendations.push(
        `Hardware incompatibility warnings: ${compatibilityReport.issues.join('; ')}`
      );
    }
    if (selectedPrecision === 'fp16' && updatedScalingReport.currentScale <= 2.0) {
      recommendations.push(
        'FP16 scaling factor is critically low. Monitor training closely for sudden gradient divergence.'
      );
    }

    // Compile report
    const precisionReport: PrecisionReport = {
      reportId: `REP-PREC-${sessionId}-${step}-${Date.now()}`,
      sessionId,
      precisionMode: selectedPrecision,
      compatibilityReport,
      lossScalingReport: updatedScalingReport,
      overflowReport,
      recommendations,
      createdAt: Date.now()
    };

    // Update history, metrics and validation
    precisionHistory.logAction(
      sessionId,
      `Step ${step}: Precision ${selectedPrecision}, scale ${updatedScalingReport.currentScale}. Overflow: ${overflowReport.hasOverflow}`,
      precisionReport
    );

    precisionMetrics.recordStep(
      sessionId,
      step,
      selectedPrecision,
      updatedScalingReport.currentScale,
      overflowReport.hasOverflow,
      overflowReport.hasUnderflow,
      compatibilityReport.isCompatible
    );

    precisionEvents.emit(PrecisionEventType.ReportsPublished, { sessionId, precisionReport });

    return {
      precisionReport,
      precisionMode: selectedPrecision,
      scalingFactor: updatedScalingReport.currentScale,
      hasOverflow: overflowReport.hasOverflow
    };
  }
}

export const precisionCoordinator = new PrecisionCoordinator();
export default precisionCoordinator;

import { HardwareProfile, TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import { GradientReportModel } from '../gradientEngine/gradientTypes';
import { LossReportModel } from '../lossEngine/lossTypes';
import {
  PrecisionReport,
  PrecisionMode,
  PrecisionManifest,
  PrecisionMetrics,
  PrecisionEventListener,
  PrecisionPolicy,
  CompatibilityReport
} from './precisionTypes';
import { precisionCoordinator } from './precisionCoordinator';
import { precisionCompatibility } from './precisionCompatibility';
import { precisionHistory } from './precisionHistory';
import { precisionMetrics } from './precisionMetrics';
import { precisionEvents } from './precisionEvents';
import { precisionPolicyManager } from './precisionPolicyManager';
import { precisionManifest } from './precisionManifest';
import { lossScalingManager } from './lossScalingManager';
import { overflowMonitor } from './overflowMonitor';

export class MixedPrecisionEngine {
  public async processSessionStep(
    sessionId: string,
    step: number,
    config: TrainingConfigModel,
    hardwareProfile: HardwareProfile,
    gradientReport?: GradientReportModel,
    lossReport?: LossReportModel
  ): Promise<{
    precisionReport: PrecisionReport;
    manifest: PrecisionManifest;
    precisionMode: PrecisionMode;
    scalingFactor: number;
    hasOverflow: boolean;
  }> {
    const res = await precisionCoordinator.executePipeline(
      sessionId,
      step,
      config,
      hardwareProfile,
      gradientReport,
      lossReport
    );

    const manifest = precisionManifest.createManifest(res.precisionReport);

    return {
      ...res,
      manifest
    };
  }

  public inspectCompatibility(
    hardwareProfile: HardwareProfile,
    requestedMode: PrecisionMode
  ): CompatibilityReport {
    return precisionCompatibility.validateCompatibility(hardwareProfile, requestedMode);
  }

  public getPolicy(sessionId: string): PrecisionPolicy | undefined {
    return precisionPolicyManager.getPolicy(sessionId);
  }

  public getOrCreatePolicy(
    sessionId: string,
    precisionMode: PrecisionMode,
    customOverrides?: Partial<PrecisionPolicy>
  ): PrecisionPolicy {
    return precisionPolicyManager.getOrCreatePolicy(sessionId, precisionMode, customOverrides);
  }

  public updatePolicy(sessionId: string, updates: Partial<PrecisionPolicy>): PrecisionPolicy {
    return precisionPolicyManager.updatePolicy(sessionId, updates);
  }

  public getHistory(sessionId?: string) {
    return precisionHistory.getHistory(sessionId);
  }

  public getMetrics(sessionId: string): PrecisionMetrics {
    return precisionMetrics.getMetricsSummary(sessionId);
  }

  public subscribe(listener: PrecisionEventListener): () => void {
    return precisionEvents.subscribe(listener);
  }

  public clearHistory(sessionId?: string): void {
    if (sessionId) {
      precisionHistory.clear(); // clears all or filters, but since clear has no sessionId filter let's just clear
      precisionMetrics.clearSession(sessionId);
      precisionPolicyManager.clearSession(sessionId);
      lossScalingManager.clearSession(sessionId);
      overflowMonitor.clearSession(sessionId);
    } else {
      precisionHistory.clear();
      precisionMetrics.clearAll();
      precisionPolicyManager.clearAll();
      lossScalingManager.clearAll();
      overflowMonitor.clearAll();
      precisionEvents.clear();
    }
  }
}

export const mixedPrecisionEngine = new MixedPrecisionEngine();
export default mixedPrecisionEngine;

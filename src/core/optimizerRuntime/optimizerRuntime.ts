import {
  OptimizerStateModel,
  OptimizerReportModel,
  LrReportModel,
  ParameterUpdateReportModel,
  ValidationReportModel,
  OptimizerManifestModel,
  LrScheduleType,
  OptimizerPolicyConfig,
  OptimizerEventListener
} from './optimizerTypes';
import { optimizerCoordinator } from './optimizerCoordinator';
import { optimizerHistory } from './optimizerHistory';
import { optimizerMetrics } from './optimizerMetrics';
import { optimizerEvents } from './optimizerEvents';
import { optimizerManifest } from './optimizerManifest';
import { optimizerRegistry } from './optimizerRegistry';

export class OptimizerRuntime {
  public async optimize(
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
    manifest: OptimizerManifestModel;
  }> {
    const res = await optimizerCoordinator.executePipeline(
      sessionId,
      state,
      gradNorm,
      schedule,
      policy,
      totalSteps,
      warmupSteps
    );
    const manifest = optimizerManifest.createManifest(res.optimizerReport);

    return {
      ...res,
      manifest
    };
  }

  public getHistoryLogs() {
    return optimizerHistory.getHistory();
  }

  public getMetricsSummary() {
    return optimizerMetrics.getSummary();
  }

  public subscribe(listener: OptimizerEventListener): () => void {
    return optimizerEvents.subscribe(listener);
  }

  public clearHistory(): void {
    optimizerRegistry.clear();
    optimizerHistory.clear();
    optimizerMetrics.clear();
    optimizerEvents.clear();
  }
}

export const optimizerRuntime = new OptimizerRuntime();
export default optimizerRuntime;

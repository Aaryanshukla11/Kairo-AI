import {
  TensorGradientModel,
  GradientReportModel,
  AnomalyReportModel,
  ValidationReportModel,
  ClippingPolicyConfig,
  GradientManifestModel,
  GradientEventListener
} from './gradientTypes';
import { gradientCoordinator } from './gradientCoordinator';
import { gradientInspector } from './gradientInspector';
import { gradientStatistics, GradientStatsComparison } from './gradientStatistics';
import { gradientHistory } from './gradientHistory';
import { gradientMetrics } from './gradientMetrics';
import { gradientEvents } from './gradientEvents';
import { gradientManifest } from './gradientManifest';

export class GradientEngine {
  public async processGradients(
    sessionId: string,
    layers: TensorGradientModel[],
    clippingPolicy: ClippingPolicyConfig,
    framework: string
  ): Promise<{
    validationReport: ValidationReportModel;
    anomalyReport: AnomalyReportModel;
    gradientReport: GradientReportModel;
    manifest: GradientManifestModel;
    clippedCount: number;
  }> {
    const res = await gradientCoordinator.executePipeline(sessionId, layers, clippingPolicy, framework);
    const manifest = gradientManifest.createManifest(res.gradientReport);

    return {
      ...res,
      manifest
    };
  }

  public inspectLayer(layers: TensorGradientModel[], layerName: string): TensorGradientModel | undefined {
    return gradientInspector.inspectLayer(layers, layerName);
  }

  public compareReports(r1: GradientReportModel, r2: GradientReportModel): GradientStatsComparison {
    return gradientStatistics.compare(r1, r2);
  }

  public getHistoryLogs() {
    return gradientHistory.getHistory();
  }

  public getMetricsSummary() {
    return gradientMetrics.getSummary();
  }

  public subscribe(listener: GradientEventListener): () => void {
    return gradientEvents.subscribe(listener);
  }

  public clearHistory(): void {
    gradientHistory.clear();
    gradientMetrics.clear();
    gradientEvents.clear();
  }
}

export const gradientEngine = new GradientEngine();
export default gradientEngine;

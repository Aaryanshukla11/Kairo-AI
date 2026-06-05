import {
  TensorGradientModel,
  GradientReportModel,
  AnomalyReportModel,
  ValidationReportModel,
  ClippingPolicyConfig,
  GradientEventType
} from './gradientTypes';
import { gradientValidator } from './gradientValidator';
import { gradientAggregator } from './gradientAggregator';
import { anomalyDetector } from './anomalyDetector';
import { clippingManager } from './clippingManager';
import { gradientInspector } from './gradientInspector';
import { gradientHistory } from './gradientHistory';
import { gradientMetrics } from './gradientMetrics';
import { gradientEvents } from './gradientEvents';

export class GradientCoordinator {
  public async executePipeline(
    sessionId: string,
    layers: TensorGradientModel[],
    clippingPolicy: ClippingPolicyConfig,
    framework: string
  ): Promise<{
    validationReport: ValidationReportModel;
    anomalyReport: AnomalyReportModel;
    gradientReport: GradientReportModel;
    clippedCount: number;
  }> {
    
    // 1. Receive Gradients
    gradientEvents.emit(GradientEventType.GradientsReceived, { sessionId });

    // 2. Validate
    const validationReport = gradientValidator.validate(layers, framework);
    gradientEvents.emit(GradientEventType.Validated, { validationReport });
    if (!validationReport.isValid) {
      gradientHistory.logAction(sessionId, 'Validation failed: ' + validationReport.errors.join(', '));
    }

    // 3. Apply Clipping Policy
    const { clippedCount } = clippingManager.applyClipping(layers, clippingPolicy);
    if (clippedCount > 0) {
      gradientMetrics.logClipping();
      gradientEvents.emit(GradientEventType.Clipped, { clippedCount });
    }

    // 4. Aggregate Gradients
    const gradientReport = gradientAggregator.aggregate(sessionId, layers);
    gradientEvents.emit(GradientEventType.Aggregated, { gradientReport });

    // 5. Inspect & Generate Statistics
    gradientEvents.emit(GradientEventType.Inspected);
    gradientEvents.emit(GradientEventType.StatisticsGenerated);

    // 6. Detect Anomalies
    const anomalyReport = anomalyDetector.detectAnomalies(layers);
    if (anomalyReport.hasAnomaly) {
      gradientMetrics.logAnomaly();
    }
    gradientEvents.emit(GradientEventType.AnomaliesDetected, { anomalyReport });

    // 7. Publish Reports
    gradientHistory.logAction(sessionId, `Processed gradients pipeline: global norm ${gradientReport.globalNorm}.`);
    gradientEvents.emit(GradientEventType.ReportsPublished);

    return {
      validationReport,
      anomalyReport,
      gradientReport,
      clippedCount
    };
  }
}

export const gradientCoordinator = new GradientCoordinator();
export default gradientCoordinator;

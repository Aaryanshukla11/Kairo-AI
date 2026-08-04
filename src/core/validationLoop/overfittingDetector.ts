import { TrainingMetricsModel } from '../trainingEngine/trainingTypes';
import { ValidationMetricModel, OverfittingReport } from './validationTypes';

export class OverfittingDetector {
  public detectOverfitting(
    currentMetrics: ValidationMetricModel,
    trainingMetricsHistory: TrainingMetricsModel[],
    validationHistoryMetrics: ValidationMetricModel[]
  ): OverfittingReport {
    const issues: string[] = [];
    let lossDivergence = false;
    let accuracyDegradation = false;
    let validationPlateau = false;
    let metricInstability = false;
    let generalizationGap = false;
    let generalizationGapValue = 0;

    // 1. Generalization Gap
    if (trainingMetricsHistory.length > 0) {
      const latestTraining = trainingMetricsHistory[trainingMetricsHistory.length - 1];
      generalizationGapValue = parseFloat((currentMetrics.validationLoss - latestTraining.trainingLoss).toFixed(4));
      
      // If gap is large (e.g., validation loss > training loss + 0.4)
      if (generalizationGapValue > 0.4) {
        generalizationGap = true;
        issues.push(`Large generalization gap detected (${generalizationGapValue}). Validation loss is significantly higher than training loss.`);
      }
    }

    // Compile historical arrays for analysis
    const valLosses = validationHistoryMetrics.map(m => m.validationLoss).concat(currentMetrics.validationLoss);
    const valAccs = validationHistoryMetrics.map(m => m.accuracy).concat(currentMetrics.accuracy);
    const trainLosses = trainingMetricsHistory.map(m => m.trainingLoss);

    // 2. Loss Divergence (Val Loss increases while Train Loss decreases over last 3 checks)
    if (valLosses.length >= 3 && trainLosses.length >= 3) {
      const recentVal = valLosses.slice(-3);
      const recentTrain = trainLosses.slice(-3);

      const valLossIsIncreasing = recentVal[2] > recentVal[1] && recentVal[1] > recentVal[0];
      const trainLossIsDecreasing = recentTrain[2] < recentTrain[1] && recentTrain[1] < recentTrain[0];

      if (valLossIsIncreasing && trainLossIsDecreasing) {
        lossDivergence = true;
        issues.push('Loss divergence detected! Validation loss is increasing while training loss continues to decrease.');
      }
    }

    // 3. Accuracy Degradation (Validation accuracy decreases over last 3 checks)
    if (valAccs.length >= 3) {
      const recentAcc = valAccs.slice(-3);
      if (recentAcc[2] < recentAcc[1] && recentAcc[1] < recentAcc[0]) {
        accuracyDegradation = true;
        issues.push('Accuracy degradation! Validation accuracy has consistently declined over the last 3 validation checks.');
      }
    }

    // 4. Validation Plateau (Val loss slope near 0 while Train loss is still decreasing)
    if (valLosses.length >= 3 && trainLosses.length >= 3) {
      const recentVal = valLosses.slice(-3);
      const recentTrain = trainLosses.slice(-3);

      const valLossDelta = Math.abs(recentVal[2] - recentVal[1]) + Math.abs(recentVal[1] - recentVal[0]);
      const trainLossIsDecreasing = recentTrain[2] < recentTrain[1] && recentTrain[1] < recentTrain[0];

      if (valLossDelta < 0.01 && trainLossIsDecreasing) {
        validationPlateau = true;
        issues.push('Validation plateau reached! Validation loss has flattened while training loss is still actively decreasing.');
      }
    }

    // 5. Metric Instability (High variance / oscillations in validation loss)
    if (valLosses.length >= 4) {
      const window = valLosses.slice(-4);
      let sum = 0;
      window.forEach(v => sum += v);
      const mean = sum / 4;
      let varianceSum = 0;
      window.forEach(v => varianceSum += Math.pow(v - mean, 2));
      const variance = varianceSum / 4;

      if (variance > 0.05) {
        metricInstability = true;
        issues.push(`High validation metric instability detected (variance ${variance.toFixed(4)}). Validation loss is oscillating.`);
      }
    }

    // Determine Severity
    let severity: 'low' | 'medium' | 'high' | 'critical' | 'none' = 'none';
    const totalIssues = (lossDivergence ? 1 : 0) + 
                        (accuracyDegradation ? 1 : 0) + 
                        (validationPlateau ? 1 : 0) + 
                        (metricInstability ? 1 : 0) + 
                        (generalizationGap ? 1 : 0);

    if (lossDivergence || totalIssues >= 3) {
      severity = 'critical';
    } else if (totalIssues === 2) {
      severity = 'high';
    } else if (totalIssues === 1) {
      severity = 'medium';
    } else if (valLosses.length > 0) {
      severity = 'low';
    }

    return {
      lossDivergence,
      accuracyDegradation,
      validationPlateau,
      metricInstability,
      generalizationGap,
      generalizationGapValue,
      severity,
      issues
    };
  }
}

export const overfittingDetector = new OverfittingDetector();
export default overfittingDetector;

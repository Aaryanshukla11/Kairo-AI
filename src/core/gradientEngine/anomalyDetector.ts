import { TensorGradientModel, AnomalyReportModel } from './gradientTypes';

export class AnomalyDetector {
  public detectAnomalies(layers: TensorGradientModel[]): AnomalyReportModel {
    let nanDetected = false;
    let infDetected = false;
    let explodingGradients = false;
    let vanishingGradients = false;
    let sparseGradients = false;
    let missingGradients = false;
    const issues: string[] = [];

    if (layers.length === 0) {
      missingGradients = true;
      issues.push('Anomaly Error: Missing gradients. No layers were processed.');
    }

    layers.forEach(l => {
      // 1. Nan / Infinity Check
      l.values.forEach(v => {
        if (Number.isNaN(v)) {
          nanDetected = true;
        }
        if (!Number.isFinite(v)) {
          infDetected = true;
        }
      });

      // 2. Exploding check (norm > 10.0)
      if (l.gradNorm > 10.0) {
        explodingGradients = true;
        issues.push(`Anomaly Error: Exploding gradients detected in layer ${l.layerName} (norm=${l.gradNorm}).`);
      }

      // 3. Vanishing check (norm < 1e-7)
      if (l.gradNorm < 1e-7) {
        vanishingGradients = true;
        issues.push(`Anomaly Warning: Vanishing gradients detected in layer ${l.layerName} (norm=${l.gradNorm}).`);
      }

      // 4. Sparse check (density < 0.1)
      if (l.gradDensity < 0.1) {
        sparseGradients = true;
        issues.push(`Anomaly Warning: High sparsity detected in layer ${l.layerName} (density=${l.gradDensity}).`);
      }
    });

    if (nanDetected) issues.push('Anomaly Error: NaN values detected inside gradient tensors.');
    if (infDetected) issues.push('Anomaly Error: Infinity values detected inside gradient tensors.');

    const hasAnomaly =
      nanDetected ||
      infDetected ||
      explodingGradients ||
      vanishingGradients ||
      sparseGradients ||
      missingGradients;

    return {
      hasAnomaly,
      nanDetected,
      infDetected,
      explodingGradients,
      vanishingGradients,
      sparseGradients,
      missingGradients,
      issues
    };
  }
}

export const anomalyDetector = new AnomalyDetector();
export default anomalyDetector;

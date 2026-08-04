import { ConvergenceReportModel, ConvergenceStatus } from './lossTypes';

export class ConvergenceAnalyzer {
  public analyze(history: number[]): ConvergenceReportModel {
    const len = history.length;

    if (len < 5) {
      return {
        status: 'Unknown',
        slope: 0,
        message: 'Insufficient history data steps to analyze convergence trends.'
      };
    }

    // Compute simple linear regression slope
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    history.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const num = len * sumXY - sumX * sumY;
    const den = len * sumXX - sumX * sumX;
    const slope = den !== 0 ? num / den : 0;

    let status: ConvergenceStatus = 'Stable convergence';
    let message = 'Loss is consistently decreasing and stable.';

    if (slope > 0.05) {
      status = 'Divergence';
      message = 'Alert: Loss values are increasing significantly (Divergence risk).';
    } else if (Math.abs(slope) < 0.001) {
      status = 'Plateau';
      message = 'Info: Loss slope has flattened. Optimization plateau reached.';
    } else if (slope > 0.001 && slope <= 0.05) {
      status = 'Oscillation';
      message = 'Loss is oscillating or slowly increasing.';
    } else if (slope < -0.05) {
      status = 'Stable convergence';
      message = 'Gradients convergence is fast and stable.';
    } else {
      status = 'Slow convergence';
      message = 'Convergence is active but slow.';
    }

    return {
      status,
      slope: parseFloat(slope.toFixed(6)),
      message
    };
  }
}

export const convergenceAnalyzer = new ConvergenceAnalyzer();
export default convergenceAnalyzer;

import { TensorGradientModel, GradientReportModel } from './gradientTypes';

export class GradientAggregator {
  public aggregate(
    sessionId: string,
    layers: TensorGradientModel[]
  ): GradientReportModel {
    const reportId = `GRAD-REP-${sessionId}-${Date.now()}`;
    
    if (layers.length === 0) {
      return {
        reportId,
        sessionId,
        globalNorm: 0,
        globalMean: 0,
        globalVariance: 0,
        layers: [],
        createdAt: Date.now()
      };
    }

    let normSumSquares = 0;
    let meanSum = 0;
    let varianceSum = 0;

    layers.forEach(l => {
      normSumSquares += l.gradNorm * l.gradNorm;
      meanSum += l.gradMean;
      varianceSum += l.gradVariance;
    });

    const globalNorm = parseFloat(Math.sqrt(normSumSquares).toFixed(4));
    const globalMean = parseFloat((meanSum / layers.length).toFixed(4));
    const globalVariance = parseFloat((varianceSum / layers.length).toFixed(4));

    return {
      reportId,
      sessionId,
      globalNorm,
      globalMean,
      globalVariance,
      layers: layers.map(l => ({ ...l })),
      createdAt: Date.now()
    };
  }
}

export const gradientAggregator = new GradientAggregator();
export default gradientAggregator;

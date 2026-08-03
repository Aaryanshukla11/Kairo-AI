import { ExperimentMetricsModel } from '../experimentTypes';

export class EvaluationProvider {
  public getSampleMetrics(): ExperimentMetricsModel {
    return {
      accuracy: 0.88,
      throughputTokensPerSec: 120,
      gpuUsagePercent: 45.0,
      vramUsageMB: 4096
    };
  }
}

export const evaluationProvider = new EvaluationProvider();
export default evaluationProvider;

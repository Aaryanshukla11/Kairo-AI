import { ExperimentMetricsModel } from '../experimentTypes';

export class BenchmarkProvider {
  public getSampleMetrics(): ExperimentMetricsModel {
    return {
      throughputTokensPerSec: 1500,
      gpuUsagePercent: 88.0,
      vramUsageMB: 12288
    };
  }
}

export const benchmarkProvider = new BenchmarkProvider();
export default benchmarkProvider;

import { ExperimentMetricsModel } from '../experimentTypes';

export class TokenizerProvider {
  public getSampleMetrics(): ExperimentMetricsModel {
    return {
      throughputTokensPerSec: 42000,
      ramUsageMB: 256,
      trainingTimeSec: 45
    };
  }
}

export const tokenizerProvider = new TokenizerProvider();
export default tokenizerProvider;

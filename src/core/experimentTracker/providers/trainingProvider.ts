import { ExperimentMetricsModel } from '../experimentTypes';

export class TrainingProvider {
  public getSampleMetrics(): ExperimentMetricsModel {
    return {
      trainingLoss: 1.25,
      validationLoss: 1.34,
      accuracy: 0.84,
      perplexity: 3.82,
      learningRate: 5e-5,
      throughputTokensPerSec: 14500,
      gpuUsagePercent: 92.5,
      ramUsageMB: 8192,
      vramUsageMB: 15360,
      trainingTimeSec: 3600,
      checkpointCount: 5
    };
  }
}

export const trainingProvider = new TrainingProvider();
export default trainingProvider;

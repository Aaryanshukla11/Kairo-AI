import { ExperimentMetricsModel } from '../experimentTypes';

export class CustomProvider {
  public getSampleMetrics(): ExperimentMetricsModel {
    return {
      accuracy: 0.99,
      ramUsageMB: 128,
      trainingTimeSec: 10
    };
  }
}

export const customProvider = new CustomProvider();
export default customProvider;

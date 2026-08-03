import { ExperimentModel, ExperimentMetricsModel } from './experimentTypes';
import { trainingProvider, tokenizerProvider, evaluationProvider, benchmarkProvider, customProvider } from './providers';

export class ExperimentBuilder {
  public buildExperiment(
    version: string,
    experimentType: string,
    trainingConfiguration: any,
    datasetVersion: string,
    tokenizerVersion: string,
    checkpointVersion: string | undefined,
    hardwareProfile: any,
    randomSeed: number,
    evaluationResults: any,
    overridesMetrics: Partial<ExperimentMetricsModel> = {},
    artifactsList: string[] = []
  ): ExperimentModel {
    const experimentId = `EXP-${experimentType.replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Resolve standard metrics template
    let templateMetrics: ExperimentMetricsModel = {};
    if (experimentType.includes('Training') || experimentType.includes('tuning') || experimentType.includes('Pretraining')) {
      templateMetrics = trainingProvider.getSampleMetrics();
    } else if (experimentType.includes('Tokenizer')) {
      templateMetrics = tokenizerProvider.getSampleMetrics();
    } else if (experimentType.includes('Evaluation')) {
      templateMetrics = evaluationProvider.getSampleMetrics();
    } else if (experimentType.includes('Benchmark')) {
      templateMetrics = benchmarkProvider.getSampleMetrics();
    } else {
      templateMetrics = customProvider.getSampleMetrics();
    }

    const metrics = {
      ...templateMetrics,
      ...overridesMetrics
    };

    return {
      experimentId,
      version,
      experimentType,
      trainingConfiguration,
      datasetVersion,
      tokenizerVersion,
      checkpointVersion,
      hardwareProfile,
      randomSeed,
      evaluationResults,
      metrics,
      artifacts: [...artifactsList],
      status: 'completed',
      creationTime: Date.now()
    };
  }
}

export const experimentBuilder = new ExperimentBuilder();
export default experimentBuilder;

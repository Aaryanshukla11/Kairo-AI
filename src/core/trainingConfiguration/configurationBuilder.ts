import { TrainingConfigModel, TrainingHyperparameters, HardwareProfile } from './configurationTypes';

export class ConfigurationBuilder {
  public buildConfig(
    datasetVersion: string,
    tokenizerVersion: string,
    trainingType: string,
    modelArchitecture: string,
    hyperparameters: TrainingHyperparameters,
    hardwareProfile: HardwareProfile,
    parentVersion?: string
  ): TrainingConfigModel {
    const configId = `CFG-${trainingType}-${Date.now()}`;
    const version = `1.0.0`; // Default start semver

    return {
      configId,
      version,
      parentVersion,
      trainingType,
      datasetVersion,
      tokenizerVersion,
      modelArchitecture,
      hyperparameters: { ...hyperparameters },
      hardwareProfile: { ...hardwareProfile },
      checkpointFrequency: 1000, // default steps
      evaluationFrequency: 500,
      createdAt: Date.now()
    };
  }
}

export const configurationBuilder = new ConfigurationBuilder();
export default configurationBuilder;

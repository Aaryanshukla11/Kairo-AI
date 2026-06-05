import {
  TrainingConfigModel,
  ConfigManifestModel,
  ValidationReportModel,
  TrainingHyperparameters,
  HardwareProfile,
  ConfigEventListener
} from './configurationTypes';
import { configurationEngine } from './configurationEngine';
import { configurationRegistry } from './configurationRegistry';
import { configurationVersionManager } from './configurationVersionManager';
import { configurationHistory } from './configurationHistory';
import { configurationMetrics } from './configurationMetrics';
import { configurationEvents } from './configurationEvents';

export class TrainingConfigurationSystem {
  public async createConfiguration(
    datasetVersion: string,
    tokenizerVersion: string,
    trainingType: string,
    modelArchitecture: string,
    overrides: Partial<TrainingHyperparameters>,
    hardwareProfile: HardwareProfile,
    parentVersion?: string
  ): Promise<{
    config: TrainingConfigModel;
    manifest: ConfigManifestModel;
    report: ValidationReportModel;
  }> {
    return configurationEngine.buildPipeline(
      datasetVersion,
      tokenizerVersion,
      trainingType,
      modelArchitecture,
      overrides,
      hardwareProfile,
      parentVersion
    );
  }

  public getConfigurationDetails(trainingType: string, version: string): TrainingConfigModel | undefined {
    return configurationRegistry.getConfig(trainingType, version);
  }

  public listConfigurations(): TrainingConfigModel[] {
    return configurationRegistry.listConfigs();
  }

  public getVersionRelation(trainingType: string, version: string) {
    return configurationVersionManager.getRelation(trainingType, version);
  }

  public getHistoryLogs() {
    return configurationHistory.getHistory();
  }

  public getMetricsSummary() {
    return configurationMetrics.getSummary();
  }

  public subscribe(listener: ConfigEventListener): () => void {
    return configurationEvents.subscribe(listener);
  }

  public clearHistory(): void {
    configurationRegistry.clear();
    configurationVersionManager.clear();
    configurationHistory.clear();
    configurationMetrics.clear();
    configurationEvents.clear();
  }
}

export const trainingConfigurationSystem = new TrainingConfigurationSystem();
export default trainingConfigurationSystem;

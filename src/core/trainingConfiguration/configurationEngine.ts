import {
  TrainingConfigModel,
  ConfigManifestModel,
  ValidationReportModel,
  TrainingHyperparameters,
  HardwareProfile,
  ConfigEventType
} from './configurationTypes';
import { hyperparameterManager } from './hyperparameterManager';
import { configurationBuilder } from './configurationBuilder';
import { configurationValidator } from './configurationValidator';
import { configurationManifest } from './configurationManifest';
import { configurationRegistry } from './configurationRegistry';
import { configurationVersionManager } from './configurationVersionManager';
import { configurationHistory } from './configurationHistory';
import { configurationMetrics } from './configurationMetrics';
import { configurationEvents } from './configurationEvents';

export class ConfigurationEngine {
  public async buildPipeline(
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
    
    // 1. Receive Request
    configurationEvents.emit(ConfigEventType.RequestReceived);

    // 2. Build Configuration
    const template = hyperparameterManager.resolveTemplate(trainingType);
    const hyperparameters = hyperparameterManager.customize(template, overrides);

    const config = configurationBuilder.buildConfig(
      datasetVersion,
      tokenizerVersion,
      trainingType,
      modelArchitecture,
      hyperparameters,
      hardwareProfile,
      parentVersion
    );
    configurationEvents.emit(ConfigEventType.ConfigurationBuilt, { configId: config.configId });

    // 3. Validate Parameters
    const report = configurationValidator.validate(config);
    if (!report.isValid) {
      throw new Error(`Configuration Validation Error: ${report.errors.join(', ')}`);
    }
    configurationEvents.emit(ConfigEventType.ParametersValidated);

    // 4. Generate Manifest
    const manifest = configurationManifest.createManifest(config);
    configurationEvents.emit(ConfigEventType.ManifestGenerated, { manifestId: manifest.manifestId });

    // 5. Register Configuration
    configurationRegistry.register(config);
    configurationEvents.emit(ConfigEventType.ConfigurationRegistered);

    // 6. Version Configuration
    configurationVersionManager.registerRelation(trainingType, config.version, parentVersion);
    configurationEvents.emit(ConfigEventType.ConfigurationVersioned);

    // Publish reports and logs
    configurationHistory.logAction(config.configId, `Registered version ${config.version} configuration.`);
    configurationMetrics.logBuild();
    
    configurationEvents.emit(ConfigEventType.ReportsPublished);

    return {
      config,
      manifest,
      report
    };
  }
}

export const configurationEngine = new ConfigurationEngine();
export default configurationEngine;

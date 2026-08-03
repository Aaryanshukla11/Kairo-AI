import { ModelInfo, ModelState, CapabilityReport, CompatibilityReport, RegistryHealthReport, RegistryEventType } from './registryTypes';
import { modelCatalog } from './modelCatalog';
import { registryValidator } from './registryValidator';
import { modelCapabilitiesDetector } from './modelCapabilities';
import { modelCompatibilityAnalyzer } from './modelCompatibility';
import { modelHealthMonitor } from './modelHealth';
import { registryEvents } from './registryEvents';
import { registryScanner } from './registryScanner';
import { registryMetricsTracker } from './registryMetrics';

export class RegistryEngine {
  public async loadAndRegisterModels(scanPath: string): Promise<void> {
    const start = Date.now();
    registryEvents.emit(RegistryEventType.ScanStarted);

    try {
      const models = await registryScanner.scan(scanPath);
      for (const model of models) {
        const valResult = registryValidator.validate(model);
        if (valResult.errors.length > 0) {
          model.state = ModelState.Corrupted;
          model.healthStatus = 'Unhealthy';
          registryEvents.emit(RegistryEventType.RegistryError, model.modelId, { errors: valResult.errors });
        } else {
          model.state = ModelState.Ready;
          model.healthStatus = 'Healthy';
        }

        modelCatalog.add(model);
        registryEvents.emit(RegistryEventType.ModelRegistered, model.modelId, { model });
      }

      registryEvents.emit(RegistryEventType.ScanCompleted, undefined, { count: models.length });
    } catch (error: any) {
      registryEvents.emit(RegistryEventType.RegistryError, undefined, { error: error.message });
      throw error;
    } finally {
      registryMetricsTracker.recordLoadTime(Date.now() - start);
    }
  }

  public registerManualModel(model: ModelInfo): void {
    const valResult = registryValidator.validate(model);
    if (valResult.errors.length > 0) {
      throw new Error(`Registry validation failed: ${valResult.errors.join('; ')}`);
    }
    model.state = ModelState.Ready;
    modelCatalog.add(model);
    registryEvents.emit(RegistryEventType.ModelRegistered, model.modelId, { model });
  }

  public getModelCatalog(): ModelInfo[] {
    return modelCatalog.list();
  }

  public getCapabilityReport(modelId: string): CapabilityReport {
    const model = modelCatalog.get(modelId);
    if (!model) throw new Error(`Model not found: ${modelId}`);
    return modelCapabilitiesDetector.detectCapabilities(model);
  }

  public getCompatibilityReport(modelId: string, systemRamGb: number, os = process.platform, arch = process.arch): CompatibilityReport {
    const model = modelCatalog.get(modelId);
    if (!model) throw new Error(`Model not found: ${modelId}`);
    return modelCompatibilityAnalyzer.generateReport(model, systemRamGb, os, arch);
  }

  public getHealthReport(): RegistryHealthReport {
    const models = modelCatalog.list();
    return modelHealthMonitor.generateReport(models);
  }

  public getMetrics() {
    return registryMetricsTracker.getMetrics();
  }
}

export const registryEngine = new RegistryEngine();

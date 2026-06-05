import { registryEngine } from './registryEngine';
import { registryEvents } from './registryEvents';
import { ModelInfo, CapabilityReport, CompatibilityReport, RegistryHealthReport } from './registryTypes';

export class ModelRegistry {
  public async initializeRegistry(scanPath = process.cwd()): Promise<void> {
    await registryEngine.loadAndRegisterModels(scanPath);
  }

  public register(model: ModelInfo): void {
    registryEngine.registerManualModel(model);
  }

  public getModelCatalog(): ModelInfo[] {
    return registryEngine.getModelCatalog();
  }

  public getModel(modelId: string): ModelInfo | undefined {
    return this.getModelCatalog().find(m => m.modelId === modelId);
  }

  public getCapabilityReport(modelId: string): CapabilityReport {
    return registryEngine.getCapabilityReport(modelId);
  }

  public getCompatibilityReport(modelId: string, systemRamGb = 16): CompatibilityReport {
    return registryEngine.getCompatibilityReport(modelId, systemRamGb);
  }

  public getHealthReport(): RegistryHealthReport {
    return registryEngine.getHealthReport();
  }

  public subscribe(listener: any): () => void {
    return registryEvents.subscribe(listener);
  }
}

export const modelRegistry = new ModelRegistry();

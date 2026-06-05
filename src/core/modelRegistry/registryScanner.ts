import { ModelInfo, ModelState } from './registryTypes';
import { LocalFolderScanner } from './providers/localFolderScanner';
import { modelCapabilitiesDetector } from './modelCapabilities';
import { registryCache } from './registryCache';
import { registryMetricsTracker } from './registryMetrics';

export class RegistryScanner {
  private localScanner = new LocalFolderScanner();

  public async scan(directoryPath: string): Promise<ModelInfo[]> {
    const start = Date.now();
    const discovered = await this.localScanner.scanDirectory(directoryPath);
    
    const processed: ModelInfo[] = [];

    for (const model of discovered) {
      // Check cache first
      if (model.path) {
        const cached = registryCache.get(model.path);
        if (cached) {
          processed.push(cached);
          continue;
        }
      }

      // Add detected capabilities
      const capReport = modelCapabilitiesDetector.detectCapabilities(model);
      model.capabilities = capReport.supported;
      model.state = ModelState.Validated;

      if (model.path) {
        registryCache.set(model.path, model);
      }
      processed.push(model);
    }

    const duration = Date.now() - start;
    registryMetricsTracker.recordScan(duration);

    return processed;
  }
}

export const registryScanner = new RegistryScanner();

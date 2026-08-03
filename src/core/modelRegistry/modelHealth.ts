import { ModelInfo, RegistryHealthReport } from './registryTypes';

export class ModelHealthMonitor {
  private healthStates = new Map<string, 'Healthy' | 'Degraded' | 'Unhealthy'>();

  public checkHealth(model: ModelInfo): 'Healthy' | 'Degraded' | 'Unhealthy' {
    let status: 'Healthy' | 'Degraded' | 'Unhealthy' = 'Healthy';

    if (model.state === 'Corrupted') {
      status = 'Unhealthy';
    } else if (model.state === 'Unavailable') {
      status = 'Unhealthy';
    } else if (model.state === 'Deprecated') {
      status = 'Degraded';
    }

    this.healthStates.set(model.modelId, status);
    return status;
  }

  public generateReport(models: ModelInfo[]): RegistryHealthReport {
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    const issues: Array<{ modelId: string; status: string; detail: string }> = [];

    for (const model of models) {
      const status = this.checkHealth(model);
      if (status === 'Healthy') healthyCount++;
      else if (status === 'Degraded') {
        degradedCount++;
        issues.push({ modelId: model.modelId, status: 'Degraded', detail: 'Model is marked as Deprecated.' });
      } else {
        unhealthyCount++;
        issues.push({ modelId: model.modelId, status: 'Unhealthy', detail: 'Model file is Unavailable or Corrupted.' });
      }
    }

    return {
      timestamp: Date.now(),
      totalModels: models.length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      issues
    };
  }
}

export const modelHealthMonitor = new ModelHealthMonitor();

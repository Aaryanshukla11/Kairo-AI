import { HealthReport, ResourceMetrics } from './runtimeTypes';

export class RuntimeHealthMonitor {
  private status: 'Healthy' | 'Degraded' | 'Unhealthy' = 'Healthy';

  public evaluateHealth(metrics: ResourceMetrics, providerStatus: 'available' | 'unavailable'): HealthReport {
    const memoryOk = metrics.ramUsageMb < 16384; // Mock check: < 16GB RAM usage
    const vramOk = metrics.vramUsageMb < 12288;   // Mock check: < 12GB VRAM usage
    const cpuOk = metrics.cpuUsagePct < 95;      // Mock check: < 95% CPU usage
    const providerOk = providerStatus === 'available';
    const modelsAvailable = true;

    const allOk = memoryOk && vramOk && cpuOk && providerOk && modelsAvailable;
    let status: 'Healthy' | 'Degraded' | 'Unhealthy' = 'Healthy';
    let details = 'All checks passed.';

    if (!providerOk) {
      status = 'Unhealthy';
      details = 'Provider is unavailable.';
    } else if (!cpuOk || !memoryOk) {
      status = 'Degraded';
      details = `Resource warning: CPU ${metrics.cpuUsagePct}%, RAM ${metrics.ramUsageMb}MB.`;
    }

    this.status = status;

    return {
      status,
      timestamp: Date.now(),
      checks: {
        memoryOk,
        vramOk,
        cpuOk,
        providerOk,
        modelsAvailable
      },
      details
    };
  }

  public getHealthStatus(): 'Healthy' | 'Degraded' | 'Unhealthy' {
    return this.status;
  }
}

export const runtimeHealthMonitor = new RuntimeHealthMonitor();

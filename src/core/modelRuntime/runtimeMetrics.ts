import { ResourceMetrics, ModelConfig } from './runtimeTypes';

export class RuntimeMetricsTracker {
  private activeMetrics: ResourceMetrics = {
    cpuUsagePct: 0,
    gpuUsagePct: 0,
    ramUsageMb: 0,
    vramUsageMb: 0,
    threadsUsed: 0,
    contextLength: 0,
    inferenceTimeMs: 0,
    tokenThroughputTps: 0
  };

  public getMetrics(activeModel?: ModelConfig, isBusy?: boolean, queueLength?: number): ResourceMetrics {
    const baseRam = 150; // MB
    const baseCpu = 1.5; // %
    
    if (activeModel) {
      const isLarge = activeModel.modelId.includes('7b') || activeModel.name.includes('7B');
      const vramUsageMb = isLarge ? 4200 : 2500;
      const ramUsageMb = baseRam + (isBusy ? 700 : 70);
      const cpuUsagePct = baseCpu + (isBusy ? 45 : 0.5);
      const gpuUsagePct = isBusy ? 65 : 0;
      const threadsUsed = isBusy ? 4 : 1;
      const tokenThroughputTps = isBusy ? 25.5 : 0;
      
      this.activeMetrics = {
        cpuUsagePct,
        gpuUsagePct,
        ramUsageMb,
        vramUsageMb,
        threadsUsed,
        contextLength: activeModel.contextWindow,
        inferenceTimeMs: isBusy ? 1200 : 0,
        tokenThroughputTps
      };
    } else {
      this.activeMetrics = {
        cpuUsagePct: baseCpu,
        gpuUsagePct: 0,
        ramUsageMb: baseRam,
        vramUsageMb: 0,
        threadsUsed: 1,
        contextLength: 0,
        inferenceTimeMs: 0,
        tokenThroughputTps: 0
      };
    }

    return this.activeMetrics;
  }

  public updateManualMetrics(metrics: Partial<ResourceMetrics>): void {
    this.activeMetrics = {
      ...this.activeMetrics,
      ...metrics
    };
  }
}

export const runtimeMetricsTracker = new RuntimeMetricsTracker();

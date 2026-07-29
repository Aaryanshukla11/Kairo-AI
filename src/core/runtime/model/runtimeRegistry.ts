export interface RuntimeRegistryStats {
  loadedModel: string;
  memoryUsageMb: number;
  vramUsageMb: number;
  cpuUsagePct: number;
  inferenceSpeedTps: number;
  queueLength: number;
}

export class RuntimeRegistry {
  /**
   * Constructs mock performance metrics based on active execution status.
   */
  public getStats(modelName: string, stateBusy: boolean, queueLength: number): RuntimeRegistryStats {
    const cpuUsagePct = stateBusy ? 45 : 2;
    const vramUsageMb = modelName.includes('7B') ? 4200 : 4900;
    
    return {
      loadedModel: modelName,
      memoryUsageMb: stateBusy ? 850 : 220,
      vramUsageMb,
      cpuUsagePct,
      inferenceSpeedTps: stateBusy ? 28.5 : 0.0,
      queueLength
    };
  }
}

export const runtimeRegistry = new RuntimeRegistry();

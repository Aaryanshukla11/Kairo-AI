import { RuntimeMetricsMap } from './optimizationTypes';

export class OptimizationMetrics {
  private runsCount = 0;

  public logRun(): void {
    this.runsCount++;
  }

  public getStats() {
    return {
      runsCount: this.runsCount
    };
  }

  public clear(): void {
    this.runsCount = 0;
  }
}

export const optimizationMetrics = new OptimizationMetrics();

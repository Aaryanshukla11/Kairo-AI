export interface DepMetricsData {
  scansCount: number;
  totalDependenciesDetected: number;
  circularCyclesCount: number;
}

export class DependencyMetrics {
  private data: DepMetricsData = {
    scansCount: 0,
    totalDependenciesDetected: 0,
    circularCyclesCount: 0
  };

  public recordScan(depsCount: number, cyclesCount: number): void {
    this.data.scansCount++;
    this.data.totalDependenciesDetected += depsCount;
    this.data.circularCyclesCount += cyclesCount;
  }

  public getMetrics(): DepMetricsData {
    return this.data;
  }
}

export const dependencyMetrics = new DependencyMetrics();

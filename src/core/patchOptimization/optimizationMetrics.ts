export interface OptimizationMetricsData {
  totalOptimizations: number;
  totalBytesSaved: number;
}

export class OptimizationMetrics {
  private data: OptimizationMetricsData = {
    totalOptimizations: 0,
    totalBytesSaved: 0
  };

  public record(savedBytes: number): void {
    this.data.totalOptimizations++;
    this.data.totalBytesSaved += savedBytes;
  }

  public getMetrics(): OptimizationMetricsData {
    return this.data;
  }
}

export const optimizationMetrics = new OptimizationMetrics();

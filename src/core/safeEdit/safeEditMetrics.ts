export interface SafeEditMetricsData {
  totalEvaluations: number;
  totalBlocks: number;
}

export class SafeEditMetrics {
  private data: SafeEditMetricsData = {
    totalEvaluations: 0,
    totalBlocks: 0
  };

  public record(blocked: boolean): void {
    this.data.totalEvaluations++;
    if (blocked) {
      this.data.totalBlocks++;
    }
  }

  public getMetrics(): SafeEditMetricsData {
    return this.data;
  }
}

export const safeEditMetrics = new SafeEditMetrics();

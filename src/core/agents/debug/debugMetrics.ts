export interface DebugMetricsData {
  debugRunsCount: number;
  criticalFailuresCount: number;
  avgConfidenceScore: number;
}

export class DebugMetrics {
  private data: DebugMetricsData = {
    debugRunsCount: 0,
    criticalFailuresCount: 0,
    avgConfidenceScore: 0
  };

  public recordRun(hasCritical: boolean, score: number): void {
    const totalScore = (this.data.avgConfidenceScore * this.data.debugRunsCount) + score;

    this.data.debugRunsCount++;
    if (hasCritical) {
      this.data.criticalFailuresCount++;
    }
    this.data.avgConfidenceScore = Math.round(totalScore / this.data.debugRunsCount);
  }

  public getMetrics(): DebugMetricsData {
    return this.data;
  }
}

export const debugMetrics = new DebugMetrics();

export interface PerfMetricsData {
  runsCount: number;
  avgOverallScore: number;
  highestBuildTimeMs: number;
}

export class PerformanceMetrics {
  private data: PerfMetricsData = {
    runsCount: 0,
    avgOverallScore: 0,
    highestBuildTimeMs: 0
  };

  public recordRun(score: number, buildTime: number): void {
    const totalScore = (this.data.avgOverallScore * this.data.runsCount) + score;

    this.data.runsCount++;
    this.data.avgOverallScore = Math.round(totalScore / this.data.runsCount);
    if (buildTime > this.data.highestBuildTimeMs) {
      this.data.highestBuildTimeMs = buildTime;
    }
  }

  public getMetrics(): PerfMetricsData {
    return this.data;
  }
}

export const performanceMetrics = new PerformanceMetrics();

export interface TestingMetricsData {
  runsCount: number;
  totalDurationMs: number;
  totalPassedCount: number;
  totalFailedCount: number;
  avgConfidenceScore: number;
  avgCoverageEstimate: number;
}

export class TestingMetrics {
  private data: TestingMetricsData = {
    runsCount: 0,
    totalDurationMs: 0,
    totalPassedCount: 0,
    totalFailedCount: 0,
    avgConfidenceScore: 0,
    avgCoverageEstimate: 0
  };

  public recordRun(
    durationMs: number,
    passed: number,
    failed: number,
    confidence: number,
    coverage: number
  ): void {
    const totalConfidence = (this.data.avgConfidenceScore * this.data.runsCount) + confidence;
    const totalCoverage = (this.data.avgCoverageEstimate * this.data.runsCount) + coverage;

    this.data.runsCount++;
    this.data.totalDurationMs += durationMs;
    this.data.totalPassedCount += passed;
    this.data.totalFailedCount += failed;
    
    this.data.avgConfidenceScore = Math.round(totalConfidence / this.data.runsCount);
    this.data.avgCoverageEstimate = Math.round(totalCoverage / this.data.runsCount);
  }

  public getMetrics(): TestingMetricsData {
    return this.data;
  }
}

export const testingMetrics = new TestingMetrics();

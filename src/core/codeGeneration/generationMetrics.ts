export interface GenMetricsData {
  generationsCount: number;
  totalLinesGenerated: number;
  totalDurationMs: number;
}

export class GenerationMetrics {
  private data: GenMetricsData = {
    generationsCount: 0,
    totalLinesGenerated: 0,
    totalDurationMs: 0
  };

  public record(linesCount: number, durationMs: number): void {
    this.data.generationsCount++;
    this.data.totalLinesGenerated += linesCount;
    this.data.totalDurationMs += durationMs;
  }

  public getMetrics(): GenMetricsData {
    return this.data;
  }
}

export const generationMetrics = new GenerationMetrics();

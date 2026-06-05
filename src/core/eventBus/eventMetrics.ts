export class EventMetrics {
  private count = 0;
  private totalLatency = 0;

  public record(latencyMs: number): void {
    this.count++;
    this.totalLatency += latencyMs;
  }

  public getThroughput(): number {
    return this.count;
  }

  public getAverageLatency(): number {
    return this.count > 0 ? Math.round((this.totalLatency / this.count) * 100) / 100 : 0;
  }
}
export const eventMetrics = new EventMetrics();

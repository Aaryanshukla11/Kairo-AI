export class DependencyMetrics {
  private history: Array<{
    timestamp: number;
    nodeCount: number;
    edgeCount: number;
    resolutionTimeMs: number;
    hasCycles: boolean;
  }> = [];

  public record(nodeCount: number, edgeCount: number, resolutionTimeMs: number, hasCycles: boolean): void {
    this.history.push({
      timestamp: Date.now(),
      nodeCount,
      edgeCount,
      resolutionTimeMs,
      hasCycles
    });
  }

  public getHistory() {
    return this.history;
  }

  public getStats() {
    if (this.history.length === 0) {
      return { avgTimeMs: 0, totalRuns: 0, totalCyclesDetected: 0 };
    }
    const totalTime = this.history.reduce((sum, r) => sum + r.resolutionTimeMs, 0);
    const cyclesCount = this.history.filter(r => r.hasCycles).length;
    return {
      avgTimeMs: totalTime / this.history.length,
      totalRuns: this.history.length,
      totalCyclesDetected: cyclesCount
    };
  }
}

export const dependencyMetrics = new DependencyMetrics();

export interface ReplanningMetricsModel {
  totalReplans: number;
  successfulReplans: number;
  preservedTasksCount: number;
  replannedTasksCount: number;
  avgConfidence: number;
  avgReplanningTimeMs: number;
}

export class ReplanningMetricsCollector {
  private metrics: ReplanningMetricsModel = {
    totalReplans: 0,
    successfulReplans: 0,
    preservedTasksCount: 0,
    replannedTasksCount: 0,
    avgConfidence: 1.0,
    avgReplanningTimeMs: 0
  };

  recordReplan(preserved: number, replanned: number, confidence: number, durationMs: number): ReplanningMetricsModel {
    this.metrics.totalReplans += 1;
    this.metrics.successfulReplans += 1;
    this.metrics.preservedTasksCount += preserved;
    this.metrics.replannedTasksCount += replanned;
    this.metrics.avgConfidence = Number(((this.metrics.avgConfidence + confidence) / 2).toFixed(2));
    this.metrics.avgReplanningTimeMs = Math.round((this.metrics.avgReplanningTimeMs + durationMs) / 2);

    return { ...this.metrics };
  }

  getMetrics(): ReplanningMetricsModel {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalReplans: 0,
      successfulReplans: 0,
      preservedTasksCount: 0,
      replannedTasksCount: 0,
      avgConfidence: 1.0,
      avgReplanningTimeMs: 0
    };
  }
}

export const replanningMetricsCollector = new ReplanningMetricsCollector();

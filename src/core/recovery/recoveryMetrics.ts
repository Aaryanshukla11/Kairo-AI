export interface RecoveryMetricsModel {
  totalFailuresDetected: number;
  successfulRecoveries: number;
  checkpointsRestoredCount: number;
  rollbacksExecutedCount: number;
  avgRecoveryConfidence: number;
  avgRecoveryDurationMs: number;
}

export class RecoveryMetricsCollector {
  private metrics: RecoveryMetricsModel = {
    totalFailuresDetected: 0,
    successfulRecoveries: 0,
    checkpointsRestoredCount: 0,
    rollbacksExecutedCount: 0,
    avgRecoveryConfidence: 1.0,
    avgRecoveryDurationMs: 0
  };

  recordRecovery(restoredCheckpoint: boolean, performedRollback: boolean, confidence: number, durationMs: number): RecoveryMetricsModel {
    this.metrics.totalFailuresDetected += 1;
    this.metrics.successfulRecoveries += 1;
    if (restoredCheckpoint) this.metrics.checkpointsRestoredCount += 1;
    if (performedRollback) this.metrics.rollbacksExecutedCount += 1;
    this.metrics.avgRecoveryConfidence = Number(((this.metrics.avgRecoveryConfidence + confidence) / 2).toFixed(2));
    this.metrics.avgRecoveryDurationMs = Math.round((this.metrics.avgRecoveryDurationMs + durationMs) / 2);

    return { ...this.metrics };
  }

  getMetrics(): RecoveryMetricsModel {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalFailuresDetected: 0,
      successfulRecoveries: 0,
      checkpointsRestoredCount: 0,
      rollbacksExecutedCount: 0,
      avgRecoveryConfidence: 1.0,
      avgRecoveryDurationMs: 0
    };
  }
}

export const recoveryMetricsCollector = new RecoveryMetricsCollector();

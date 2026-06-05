export interface TaskObservabilityMetrics {
  planningTimeMs: number;
  schedulingTimeMs: number;
  criticalPathTimeMs: number;
  parallelEfficiencyPercent: number;
  estimatedCostUSD: number;
  planningConfidence: number; // 0.0 - 1.0
}

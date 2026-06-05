export class ExecutionMetrics {
  private totalPlansGenerated = 0;
  private totalPlanningTimeMs = 0;
  private totalCheckpointsCreated = 0;

  public record(planningDurationMs: number, checkpointsCount: number): void {
    this.totalPlansGenerated++;
    this.totalPlanningTimeMs += planningDurationMs;
    this.totalCheckpointsCreated += checkpointsCount;
  }

  public getStats() {
    return {
      totalPlansGenerated: this.totalPlansGenerated,
      totalCheckpointsCreated: this.totalCheckpointsCreated,
      averagePlanningTimeMs: this.totalPlansGenerated > 0 ? Math.round(this.totalPlanningTimeMs / this.totalPlansGenerated) : 0
    };
  }
}
export const executionMetrics = new ExecutionMetrics();

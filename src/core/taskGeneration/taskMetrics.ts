export class TaskMetrics {
  private totalTasksGenerated = 0;
  private totalGraphsGenerated = 0;
  private totalGenerationTimeMs = 0;

  public record(tasksCount: number, durationMs: number): void {
    this.totalTasksGenerated += tasksCount;
    this.totalGraphsGenerated++;
    this.totalGenerationTimeMs += durationMs;
  }

  public getStats() {
    return {
      totalTasksGenerated: this.totalTasksGenerated,
      totalGraphsGenerated: this.totalGraphsGenerated,
      averageGenerationTimeMs: this.totalGraphsGenerated > 0 ? Math.round(this.totalGenerationTimeMs / this.totalGraphsGenerated) : 0
    };
  }
}
export const taskMetrics = new TaskMetrics();

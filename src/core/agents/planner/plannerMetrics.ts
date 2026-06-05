export interface PlannerMetricsData {
  plansGeneratedCount: number;
  totalPlanningTimeMs: number;
  averageTasksPerPlan: number;
  lastPlanLatencyMs: number;
}

export class PlannerMetrics {
  private data: PlannerMetricsData = {
    plansGeneratedCount: 0,
    totalPlanningTimeMs: 0,
    averageTasksPerPlan: 0,
    lastPlanLatencyMs: 0
  };

  public recordPlanningRun(tasksCount: number, latencyMs: number): void {
    const totalTasks = (this.data.averageTasksPerPlan * this.data.plansGeneratedCount) + tasksCount;
    this.data.plansGeneratedCount++;
    this.data.totalPlanningTimeMs += latencyMs;
    this.data.lastPlanLatencyMs = latencyMs;
    this.data.averageTasksPerPlan = totalTasks / this.data.plansGeneratedCount;
  }

  public getMetrics(): PlannerMetricsData {
    return this.data;
  }
}

export const plannerMetrics = new PlannerMetrics();
